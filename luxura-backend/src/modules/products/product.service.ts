import mongoose from "mongoose";
import type { QueryFilter } from "mongoose";
import Product, { IProduct } from "../../models/Product.model";
import { AppError } from "../../middlewares/error.middleware";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ListProductsQuery {
	page?: number;
	limit?: number;
	category?: string;
	minPrice?: number;
	maxPrice?: number;
	sortBy?: string;
	search?: string;
	inStock?: boolean;
}

export interface CreateProductInput {
	name: string;
	description: string;
	price: number;
	luxuryCategory: IProduct["luxuryCategory"];
	images?: string[];
	stock: number;
	dimensions: IProduct["dimensions"];
	sku?: string;
}

export interface UpdateProductInput {
	name?: string;
	description?: string;
	price?: number;
	luxuryCategory?: IProduct["luxuryCategory"];
	images?: string[];
	stock?: number;
	dimensions?: Partial<IProduct["dimensions"]>;
	isActive?: boolean;
}

export interface PaginatedProducts {
	products: IProduct[];
	pagination: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPrevPage: boolean;
	};
}

// ─── Helper: build sort object from sortBy string ─────────────────────────────
const buildSortObject = (sortBy?: string): Record<string, 1 | -1> => {
	if (!sortBy) return { createdAt: -1 }; // default: newest first

	const direction: 1 | -1 = sortBy.startsWith("-") ? -1 : 1;
	const field = sortBy.replace(/^-/, "");

	const allowedFields: Record<string, string> = {
		price: "price",
		name: "name",
		createdAt: "createdAt",
	};

	const mongoField = allowedFields[field];
	if (!mongoField) return { createdAt: -1 };

	return { [mongoField]: direction };
};

// ─── List Products (public) ───────────────────────────────────────────────────
export const listProducts = async (query: ListProductsQuery): Promise<PaginatedProducts> => {
	const { page = 1, limit = 12, category, minPrice, maxPrice, sortBy, search, inStock } = query;

	const skip = (page - 1) * limit;

	// ── Build filter ──
	const filter: QueryFilter<IProduct> = { isActive: true };

	if (category) {
		filter.luxuryCategory = category as IProduct["luxuryCategory"];
	}

	if (minPrice !== undefined || maxPrice !== undefined) {
		filter.price = {};
		if (minPrice !== undefined) filter.price.$gte = minPrice;
		if (maxPrice !== undefined) filter.price.$lte = maxPrice;
	}

	if (inStock === true) {
		filter.stock = { $gt: 0 };
	}

	// Full-text search uses the text index on name + description
	if (search) {
		filter.$text = { $search: search };
	}

	const sortObject = buildSortObject(sortBy);

	// ── If text search, add score sort override ──
	const finalSort = search ? { score: { $meta: "textScore" as const }, ...sortObject } : sortObject;

	const [products, total] = await Promise.all([Product.find(filter).sort(finalSort).skip(skip).limit(limit).select("-__v"), Product.countDocuments(filter)]);

	const totalPages = Math.ceil(total / limit);

	return {
		products,
		pagination: {
			total,
			page,
			limit,
			totalPages,
			hasNextPage: page < totalPages,
			hasPrevPage: page > 1,
		},
	};
};

// ─── Get Single Product (public) ──────────────────────────────────────────────
export const getProductById = async (id: string): Promise<IProduct> => {
	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw new AppError("Invalid product ID", 400);
	}

	const product = await Product.findOne({ _id: id, isActive: true }).select("-__v");
	if (!product) {
		throw new AppError("Product not found", 404);
	}

	return product;
};

// ─── Create Product (admin) ───────────────────────────────────────────────────
export const createProduct = async (input: CreateProductInput): Promise<IProduct> => {
	// Check SKU uniqueness if provided
	if (input.sku) {
		const exists = await Product.findOne({
			sku: input.sku.toUpperCase(),
		});
		if (exists) {
			throw new AppError(`A product with SKU "${input.sku}" already exists`, 409);
		}
	}

	const product = await Product.create(input);
	return product;
};

// ─── Update Product (admin) ───────────────────────────────────────────────────
export const updateProduct = async (id: string, input: UpdateProductInput): Promise<IProduct> => {
	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw new AppError("Invalid product ID", 400);
	}

	// Merge dimensions partially — prevent overwriting the full object
	// with only one field update
	const updatePayload: mongoose.UpdateQuery<IProduct> = { ...input };

	if (input.dimensions) {
		const { width, height, depth, weight } = input.dimensions;
		updatePayload.$set = {};
		if (width !== undefined) updatePayload.$set["dimensions.width"] = width;
		if (height !== undefined) updatePayload.$set["dimensions.height"] = height;
		if (depth !== undefined) updatePayload.$set["dimensions.depth"] = depth;
		if (weight !== undefined) updatePayload.$set["dimensions.weight"] = weight;
		delete updatePayload.dimensions;
	}

	const product = await Product.findByIdAndUpdate(id, updatePayload, {
		new: true, // return updated document
		runValidators: true, // run schema validators on update
	}).select("-__v");

	if (!product) {
		throw new AppError("Product not found", 404);
	}

	return product;
};

// ─── Delete Product (admin) — soft delete ─────────────────────────────────────
export const deleteProduct = async (id: string): Promise<void> => {
	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw new AppError("Invalid product ID", 400);
	}

	// Soft delete: set isActive = false instead of removing from DB
	// Preserves referential integrity for existing orders
	const product = await Product.findByIdAndUpdate(id, { isActive: false }, { new: true });

	if (!product) {
		throw new AppError("Product not found", 404);
	}
};

// ─── Hard Delete (admin — permanent) ─────────────────────────────────────────
export const hardDeleteProduct = async (id: string): Promise<void> => {
	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw new AppError("Invalid product ID", 400);
	}

	const product = await Product.findByIdAndDelete(id);

	if (!product) {
		throw new AppError("Product not found", 404);
	}
};

// ─── Adjust Stock (internal — called by order service) ───────────────────────
export const adjustStock = async (
	session: mongoose.ClientSession,
	productId: string,
	quantity: number, // negative to decrement, positive to increment
): Promise<void> => {
	const product = await Product.findOneAndUpdate(
		{
			_id: productId,
			stock: { $gte: -quantity }, // ensure we won't go below 0
		},
		{ $inc: { stock: quantity } },
		{ new: true, session },
	);

	if (!product) {
		throw new AppError(`Insufficient stock or product not found for ID: ${productId}`, 400);
	}
};

// ─── Get Products by Category (admin dashboard helper) ───────────────────────
export const getProductStats = async (): Promise<unknown> => {
	const stats = await Product.aggregate([
		{ $match: { isActive: true } },
		{
			$group: {
				_id: "$luxuryCategory",
				count: { $sum: 1 },
				avgPrice: { $avg: "$price" },
				minPrice: { $min: "$price" },
				maxPrice: { $max: "$price" },
				totalStock: { $sum: "$stock" },
			},
		},
		{ $sort: { count: -1 } },
	]);

	return stats;
};
