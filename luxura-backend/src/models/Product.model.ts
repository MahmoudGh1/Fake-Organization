import mongoose, { Document, Schema, Model } from "mongoose";

// ─── Dimensions Sub-document Interface ─────────────────────────────────────
export interface IDimensions {
	width: number;
	height: number;
	depth: number;
	weight?: number;
}

// ─── Product Document Interface ─────────────────────────────────────────────
export interface IProduct extends Document {
	_id: mongoose.Types.ObjectId;
	name: string;
	description: string;
	price: number;
	luxuryCategory: "Living Room" | "Bedroom" | "Dining" | "Office" | "Outdoor" | "Accessories";
	images: string[];
	stock: number;
	dimensions: IDimensions;
	sku: string;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface IProductModel extends Model<IProduct> {}

// ─── Dimensions Sub-schema ─────────────────────────────────────────────────
const DimensionsSchema = new Schema<IDimensions>(
	{
		width: {
			type: Number,
			required: [true, "Width is required"],
			min: [0, "Width cannot be negative"],
		},
		height: {
			type: Number,
			required: [true, "Height is required"],
			min: [0, "Height cannot be negative"],
		},
		depth: {
			type: Number,
			required: [true, "Depth is required"],
			min: [0, "Depth cannot be negative"],
		},
		weight: {
			type: Number,
			min: [0, "Weight cannot be negative"],
		},
	},
	{ _id: false },
);

// ─── Product Schema ────────────────────────────────────────────────────────
const ProductSchema = new Schema<IProduct, IProductModel>(
	{
		name: {
			type: String,
			required: [true, "Product name is required"],
			trim: true,
			minlength: [2, "Name must be at least 2 characters"],
			maxlength: [120, "Name cannot exceed 120 characters"],
		},
		description: {
			type: String,
			required: [true, "Description is required"],
			trim: true,
			maxlength: [2000, "Description cannot exceed 2000 characters"],
		},
		price: {
			type: Number,
			required: [true, "Price is required"],
			min: [0, "Price cannot be negative"],
		},
		luxuryCategory: {
			type: String,
			required: [true, "Category is required"],
			enum: {
				values: ["Living Room", "Bedroom", "Dining", "Office", "Outdoor", "Accessories"],
				message: "{VALUE} is not a supported category",
			},
		},
		images: {
			type: [String],
			default: [],
			validate: {
				validator: (arr: string[]) => arr.length <= 10,
				message: "A product cannot have more than 10 images",
			},
		},
		stock: {
			type: Number,
			required: [true, "Stock quantity is required"],
			min: [0, "Stock cannot be negative"],
			default: 0,
		},
		dimensions: {
			type: DimensionsSchema,
			required: [true, "Dimensions are required"],
		},
		sku: {
			type: String,
			unique: true,
			uppercase: true,
			trim: true,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{
		timestamps: true,
		versionKey: false,
	},
);

// ─── Pre-save Hook: Auto-generate SKU ──────────────────────────────────────
ProductSchema.pre("save", function () {
	if (!this.sku) {
		const prefix = this.luxuryCategory.replace(/\s+/g, "").substring(0, 3).toUpperCase();

		const suffix = Math.random().toString(36).substring(2, 8).toUpperCase();

		this.sku = `LXR-${prefix}-${suffix}`;
	}
});

// ─── Indexes ────────────────────────────────────────────────────────────────
ProductSchema.index({ luxuryCategory: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ name: "text", description: "text" });
ProductSchema.index({ isActive: 1 });

// ─── Model Export ──────────────────────────────────────────────────────────
const Product = mongoose.model<IProduct, IProductModel>("Product", ProductSchema);

export default Product;
