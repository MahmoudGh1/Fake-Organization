import mongoose, { Document, Schema, Model } from "mongoose";

// ─── Order Item Sub-document Interface ─────────────────────────────────────
export interface IOrderItem {
	productId: mongoose.Types.ObjectId;
	name: string; // snapshot at time of purchase
	price: number; // snapshot at time of purchase
	quantity: number;
	subtotal: number; // price * quantity
}

// ─── Shipping Address Sub-document Interface ────────────────────────────────
export interface IShippingAddress {
	fullName: string;
	addressLine1: string;
	addressLine2?: string;
	city: string;
	state: string;
	postalCode: string;
	country: string;
	phone: string;
}

// ─── Order Document Interface ────────────────────────────────────────────────
export interface IOrder extends Document {
	_id: mongoose.Types.ObjectId;
	userId: mongoose.Types.ObjectId;
	items: IOrderItem[];
	totalAmount: number;
	status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
	shippingAddress: IShippingAddress;
	notes?: string;
	cancelledAt?: Date;
	cancelledBy?: mongoose.Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

export interface IOrderModel extends Model<IOrder> {}

// ─── Order Item Sub-schema ───────────────────────────────────────────────────
const OrderItemSchema = new Schema<IOrderItem>(
	{
		productId: {
			type: Schema.Types.ObjectId,
			ref: "Product",
			required: [true, "Product ID is required"],
		},
		name: {
			type: String,
			required: [true, "Product name snapshot is required"],
		},
		price: {
			type: Number,
			required: [true, "Price snapshot is required"],
			min: [0, "Price cannot be negative"],
		},
		quantity: {
			type: Number,
			required: [true, "Quantity is required"],
			min: [1, "Quantity must be at least 1"],
		},
		subtotal: {
			type: Number,
			required: true,
			min: [0, "Subtotal cannot be negative"],
		},
	},
	{ _id: false },
);

// ─── Shipping Address Sub-schema ─────────────────────────────────────────────
const ShippingAddressSchema = new Schema<IShippingAddress>(
	{
		fullName: { type: String, required: [true, "Full name is required"], trim: true },
		addressLine1: { type: String, required: [true, "Address line 1 is required"], trim: true },
		addressLine2: { type: String, trim: true },
		city: { type: String, required: [true, "City is required"], trim: true },
		state: { type: String, required: [true, "State is required"], trim: true },
		postalCode: { type: String, required: [true, "Postal code is required"], trim: true },
		country: { type: String, required: [true, "Country is required"], trim: true },
		phone: {
			type: String,
			required: [true, "Phone number is required"],
			match: [/^\+?[1-9]\d{6,14}$/, "Please provide a valid phone number"],
		},
	},
	{ _id: false },
);

// ─── Order Schema ─────────────────────────────────────────────────────────────
const OrderSchema = new Schema<IOrder, IOrderModel>(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "User ID is required"],
			index: true,
		},
		items: {
			type: [OrderItemSchema],
			required: true,
			validate: {
				validator: (arr: IOrderItem[]) => arr.length > 0,
				message: "Order must contain at least one item",
			},
		},
		totalAmount: {
			type: Number,
			required: [true, "Total amount is required"],
			min: [0, "Total amount cannot be negative"],
		},
		status: {
			type: String,
			enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
			default: "Pending",
		},
		shippingAddress: {
			type: ShippingAddressSchema,
			required: [true, "Shipping address is required"],
		},
		notes: {
			type: String,
			trim: true,
			maxlength: [500, "Notes cannot exceed 500 characters"],
		},
		cancelledAt: {
			type: Date,
			default: null,
		},
		cancelledBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
			default: null,
		},
	},
	{
		timestamps: true,
		versionKey: false,
	},
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });

const Order = mongoose.model<IOrder, IOrderModel>("Order", OrderSchema);

export default Order;
