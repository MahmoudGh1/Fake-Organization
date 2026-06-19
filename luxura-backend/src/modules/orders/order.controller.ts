import { Request, Response, NextFunction } from "express";
import * as orderService from "./order.service";

// ─── POST /api/orders ─────────────────────────────────────────────────────────
export const placeOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const order = await orderService.placeOrder(req.user!.id, req.body);

		res.status(201).json({
			success: true,
			message: "Order placed successfully",
			data: { order },
		});
	} catch (err) {
		next(err);
	}
};

// ─── GET /api/orders/user ─────────────────────────────────────────────────────
export const getUserOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const page = req.query.page ? Number(req.query.page) : 1;
		const limit = req.query.limit ? Number(req.query.limit) : 10;

		const result = await orderService.getUserOrders(req.user!.id, page, limit);

		res.status(200).json({
			success: true,
			data: result,
		});
	} catch (err) {
		next(err);
	}
};

// ─── GET /api/orders/admin ────────────────────────────────────────────────────
export const getAllOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const page = req.query.page ? Number(req.query.page) : 1;
		const limit = req.query.limit ? Number(req.query.limit) : 20;
		const status = req.query.status as string | undefined;

		const result = await orderService.getAllOrders(page, limit, status as Parameters<typeof orderService.getAllOrders>[2]);

		res.status(200).json({
			success: true,
			data: result,
		});
	} catch (err) {
		next(err);
	}
};

// ─── GET /api/orders/:id ──────────────────────────────────────────────────────
export const getOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const order = await orderService.getOrderById(req.params.id as string, req.user!.id, req.user!.role);

		res.status(200).json({
			success: true,
			data: { order },
		});
	} catch (err) {
		next(err);
	}
};

// ─── PUT /api/orders/:id ──────────────────────────────────────────────────────
export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const order = await orderService.updateOrderStatus(req.params.id as string, {
			status: req.body.status,
			notes: req.body.notes,
		});

		res.status(200).json({
			success: true,
			message: `Order status updated to "${order.status}"`,
			data: { order },
		});
	} catch (err) {
		next(err);
	}
};

// ─── DELETE /api/orders/:id ───────────────────────────────────────────────────
export const cancelOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const order = await orderService.cancelOrder(req.params.id as string, req.user!.id, req.user!.role);

		res.status(200).json({
			success: true,
			message: "Order cancelled successfully",
			data: { order },
		});
	} catch (err) {
		next(err);
	}
};

// ─── GET /api/orders/stats ────────────────────────────────────────────────────
export const getOrderStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const stats = await orderService.getOrderStats();

		res.status(200).json({
			success: true,
			data: { stats },
		});
	} catch (err) {
		next(err);
	}
};
