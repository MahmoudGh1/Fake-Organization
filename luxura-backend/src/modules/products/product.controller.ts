import { Request, Response, NextFunction } from "express";
import * as productService from "./product.service";

// ─── GET /api/products ────────────────────────────────────────────────────────
export const listProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const { page, limit, category, minPrice, maxPrice, sortBy, search, inStock } = req.query;

		const result = await productService.listProducts({
			page: page ? Number(page) : undefined,
			limit: limit ? Number(limit) : undefined,
			minPrice: minPrice ? Number(minPrice) : undefined,
			maxPrice: maxPrice ? Number(maxPrice) : undefined,
			category: category as string | undefined,
			sortBy: sortBy as string | undefined,
			search: search as string | undefined,
			inStock: inStock === "true" ? true : inStock === "false" ? false : undefined,
		});

		res.status(200).json({
			success: true,
			data: result,
		});
	} catch (err) {
		next(err);
	}
};

// ─── GET /api/products/stats ──────────────────────────────────────────────────
export const getProductStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const stats = await productService.getProductStats();

		res.status(200).json({
			success: true,
			data: { stats },
		});
	} catch (err) {
		next(err);
	}
};

// ─── GET /api/products/:id ────────────────────────────────────────────────────
export const getProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const product = await productService.getProductById(req.params.id as string);

		res.status(200).json({
			success: true,
			data: { product },
		});
	} catch (err) {
		next(err);
	}
};

// ─── POST /api/products ───────────────────────────────────────────────────────
export const createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const product = await productService.createProduct(req.body);

		res.status(201).json({
			success: true,
			message: "Product created successfully",
			data: { product },
		});
	} catch (err) {
		next(err);
	}
};

// ─── PUT /api/products/:id ────────────────────────────────────────────────────
export const updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const product = await productService.updateProduct(req.params.id as string, req.body);

		res.status(200).json({
			success: true,
			message: "Product updated successfully",
			data: { product },
		});
	} catch (err) {
		next(err);
	}
};

// ─── DELETE /api/products/:id ─────────────────────────────────────────────────
export const deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const { permanent } = req.query;

		if (permanent === "true") {
			await productService.hardDeleteProduct(req.params.id as string);
			res.status(200).json({
				success: true,
				message: "Product permanently deleted",
			});
		} else {
			await productService.deleteProduct(req.params.id as string);
			res.status(200).json({
				success: true,
				message: "Product deactivated successfully",
			});
		}
	} catch (err) {
		next(err);
	}
};
