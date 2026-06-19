import mongoose from "mongoose";
import Order, { IOrder, IOrderItem } from "../../models/Order.model";
import Product from "../../models/Product.model";
import { AppError } from "../../middlewares/error.middleware";
import { adjustStock } from "../products/product.service";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OrderItemInput {
	productId: string;
	quantity: number;
}

export interface ShippingAddressInput {
	fullName: string;
	addressLine1: string;
	addressLine2?: string;
	city: string;
	state: string;
	postalCode: string;
	country: string;
	phone: string;
}

export interface PlaceOrderInput {
	items: OrderItemInput[];
	shippingAddress: ShippingAddressInput;
	notes?: string;
}

export interface UpdateOrderStatusInput {
	status: IOrder["status"];
	notes?: string;
}

export interface PaginatedOrders {
	orders: IOrder[];
	pagination: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPrevPage: boolean;
	};
}

// ─── Valid status transitions ─────────────────────────────────────────────────
// Prevents admins from setting nonsensical status jumps
// e.g. Delivered → Pending is not allowed
const STATUS_TRANSITIONS: Record<IOrder["status"], IOrder["status"][]> = {
	Pending: ["Processing", "Cancelled"],
	Processing: ["Shipped", "Cancelled"],
	Shipped: ["Delivered"],
	Delivered: [], // terminal state
	Cancelled: [], // terminal state
};

// ─── Place Order ──────────────────────────────────────────────────────────────
export const placeOrder = async (userId: string, input: PlaceOrderInput): Promise<IOrder> => {
	const { items, shippingAddress, notes } = input;

	// ── Deduplicate items — merge quantities for repeated productIds ──
	const deduped = new Map<string, number>();
	for (const item of items) {
		const existing = deduped.get(item.productId) ?? 0;
		deduped.set(item.productId, existing + item.quantity);
	}
	const uniqueItems = Array.from(deduped.entries()).map(([productId, quantity]) => ({ productId, quantity }));

	// ── Fetch all products in a single query ──
	const productIds = uniqueItems.map((i) => i.productId);
	const products = await Product.find({
		_id: { $in: productIds },
		isActive: true,
	}).select("_id name price stock");

	// ── Validate all products exist ──
	if (products.length !== uniqueItems.length) {
		const foundIds = products.map((p) => p._id.toString());
		const missingIds = productIds.filter((id) => !foundIds.includes(id));
		throw new AppError(`The following products were not found or are unavailable: ${missingIds.join(", ")}`, 404);
	}

	// ── Build product lookup map ──
	const productMap = new Map(products.map((p) => [p._id.toString(), p]));

	// ── Validate stock availability for all items before touching DB ──
	const stockErrors: string[] = [];
	for (const item of uniqueItems) {
		const product = productMap.get(item.productId)!;
		if (product.stock < item.quantity) {
			stockErrors.push(`"${product.name}" — requested ${item.quantity}, available ${product.stock}`);
		}
	}
	if (stockErrors.length > 0) {
		throw new AppError(`Insufficient stock for the following items:\n${stockErrors.join("\n")}`, 400);
	}

	// ── Build order items with price snapshots ──
	const orderItems: IOrderItem[] = uniqueItems.map((item) => {
		const product = productMap.get(item.productId)!;
		return {
			productId: new mongoose.Types.ObjectId(item.productId),
			name: product.name,
			price: product.price,
			quantity: item.quantity,
			subtotal: parseFloat((product.price * item.quantity).toFixed(2)),
		};
	});

	// ── Calculate total ──
	const totalAmount = parseFloat(orderItems.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2));

	// ── Open MongoDB transaction ──
	// Ensures order creation + all stock decrements are atomic.
	// If any stock adjustment fails mid-way, the entire operation rolls back.
	const session = await mongoose.startSession();

	try {
		session.startTransaction();

		// Decrement stock for each item inside the transaction
		for (const item of uniqueItems) {
			await adjustStock(session, item.productId, -item.quantity);
		}

		// Create the order inside the same transaction
		const [order] = await Order.create(
			[
				{
					userId: new mongoose.Types.ObjectId(userId),
					items: orderItems,
					totalAmount,
					shippingAddress,
					notes,
					status: "Pending",
				},
			],
			{ session },
		);

		await session.commitTransaction();

		// Populate product refs for the response
		await order.populate("items.productId", "name sku images");

		return order;
	} catch (err) {
		await session.abortTransaction();
		throw err;
	} finally {
		await session.endSession();
	}
};

// ─── Get Orders for Current User ──────────────────────────────────────────────
export const getUserOrders = async (userId: string, page: number = 1, limit: number = 10): Promise<PaginatedOrders> => {
	const skip = (page - 1) * limit;

	const filter = { userId: new mongoose.Types.ObjectId(userId) };

	const [orders, total] = await Promise.all([Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("items.productId", "name sku images luxuryCategory").select("-__v"), Order.countDocuments(filter)]);

	const totalPages = Math.ceil(total / limit);

	return {
		orders,
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

// ─── Get Single Order ─────────────────────────────────────────────────────────
export const getOrderById = async (orderId: string, requestingUserId: string, requestingUserRole: "customer" | "admin"): Promise<IOrder> => {
	if (!mongoose.Types.ObjectId.isValid(orderId)) {
		throw new AppError("Invalid order ID", 400);
	}

	const order = await Order.findById(orderId).populate("items.productId", "name sku images luxuryCategory").populate("userId", "name email").select("-__v");

	if (!order) {
		throw new AppError("Order not found", 404);
	}

	// Customers can only view their own orders
	if (requestingUserRole !== "admin" && order.userId.toString() !== requestingUserId) {
		throw new AppError("You do not have permission to view this order", 403);
	}

	return order;
};

// ─── Get All Orders (admin) ───────────────────────────────────────────────────
export const getAllOrders = async (page: number = 1, limit: number = 20, status?: IOrder["status"]): Promise<PaginatedOrders> => {
	const skip = (page - 1) * limit;

	const filter: mongoose.QueryFilter<IOrder> = {};
	if (status) filter.status = status;

	const [orders, total] = await Promise.all([Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("userId", "name email").populate("items.productId", "name sku").select("-__v"), Order.countDocuments(filter)]);

	const totalPages = Math.ceil(total / limit);

	return {
		orders,
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

// ─── Update Order Status (admin) ──────────────────────────────────────────────
export const updateOrderStatus = async (orderId: string, input: UpdateOrderStatusInput): Promise<IOrder> => {
	if (!mongoose.Types.ObjectId.isValid(orderId)) {
		throw new AppError("Invalid order ID", 400);
	}

	const { status: newStatus, notes } = input;

	const order = await Order.findById(orderId);
	if (!order) {
		throw new AppError("Order not found", 404);
	}

	// ── Enforce valid transition ──
	const allowedTransitions = STATUS_TRANSITIONS[order.status];
	if (!allowedTransitions.includes(newStatus)) {
		throw new AppError(`Cannot transition order from "${order.status}" to "${newStatus}". ` + `Allowed transitions: ${allowedTransitions.length > 0 ? allowedTransitions.join(", ") : "none (terminal state)"}`, 400);
	}

	// ── If cancelling, restore stock inside a transaction ──
	if (newStatus === "Cancelled") {
		const session = await mongoose.startSession();

		try {
			session.startTransaction();

			// Only restore stock if order hasn't shipped yet
			// (once shipped, physical stock has left the warehouse)
			if (order.status !== "Shipped") {
				for (const item of order.items) {
					await adjustStock(
						session,
						item.productId.toString(),
						item.quantity, // positive = restore
					);
				}
			}

			order.status = "Cancelled";
			order.cancelledAt = new Date();
			if (notes) order.notes = notes;

			await order.save({ session });
			await session.commitTransaction();
		} catch (err) {
			await session.abortTransaction();
			throw err;
		} finally {
			await session.endSession();
		}

		return order;
	}

	// ── Non-cancellation status update ──
	order.status = newStatus;
	if (notes) order.notes = notes;
	await order.save();

	return order;
};

// ─── Cancel Order (user or admin) ────────────────────────────────────────────
export const cancelOrder = async (orderId: string, requestingUserId: string, requestingUserRole: "customer" | "admin"): Promise<IOrder> => {
	if (!mongoose.Types.ObjectId.isValid(orderId)) {
		throw new AppError("Invalid order ID", 400);
	}

	const order = await Order.findById(orderId);
	if (!order) {
		throw new AppError("Order not found", 404);
	}

	// ── Ownership check for customers ──
	if (requestingUserRole !== "admin" && order.userId.toString() !== requestingUserId) {
		throw new AppError("You do not have permission to cancel this order", 403);
	}

	// ── Customers can only cancel Pending orders ──
	if (requestingUserRole === "customer" && order.status !== "Pending") {
		throw new AppError(`Orders can only be cancelled while in "Pending" status. ` + `This order is currently "${order.status}". ` + `Please contact support for assistance.`, 400);
	}

	// ── Admins follow the transition map ──
	const allowedTransitions = STATUS_TRANSITIONS[order.status];
	if (!allowedTransitions.includes("Cancelled")) {
		throw new AppError(`This order cannot be cancelled. Current status: "${order.status}" is a terminal state.`, 400);
	}

	// ── Restore stock in a transaction ──
	const session = await mongoose.startSession();

	try {
		session.startTransaction();

		if (order.status !== "Shipped") {
			for (const item of order.items) {
				await adjustStock(session, item.productId.toString(), item.quantity);
			}
		}

		order.status = "Cancelled";
		order.cancelledAt = new Date();
		order.cancelledBy = new mongoose.Types.ObjectId(requestingUserId);

		await order.save({ session });
		await session.commitTransaction();
	} catch (err) {
		await session.abortTransaction();
		throw err;
	} finally {
		await session.endSession();
	}

	return order;
};

// ─── Order Stats (admin dashboard) ───────────────────────────────────────────
export const getOrderStats = async (): Promise<unknown> => {
	const stats = await Order.aggregate([
		{
			$facet: {
				// Total revenue from delivered orders
				revenue: [{ $match: { status: "Delivered" } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }],
				// Count by status
				byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }, { $sort: { count: -1 } }],
				// Daily orders for the last 30 days
				dailyOrders: [
					{
						$match: {
							createdAt: {
								$gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
							},
						},
					},
					{
						$group: {
							_id: {
								$dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
							},
							count: { $sum: 1 },
							revenue: { $sum: "$totalAmount" },
						},
					},
					{ $sort: { _id: 1 } },
				],
			},
		},
	]);

	const result = stats[0];

	return {
		totalRevenue: result.revenue[0]?.total ?? 0,
		byStatus: result.byStatus,
		dailyOrders: result.dailyOrders,
	};
};