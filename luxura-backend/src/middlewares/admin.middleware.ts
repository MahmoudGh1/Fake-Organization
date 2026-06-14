import { Request, Response, NextFunction } from "express";
import { AppError } from "./error.middleware.js";

/**
 * Must be chained AFTER protect middleware.
 *
 * Usage in routes:
 *   router.delete("/:id", protect, requireAdmin, controller.delete);
 */
export const requireAdmin = (req: Request, _res: Response, next: NextFunction): void => {
	if (!req.user) {
		return next(new AppError("Authentication required", 401));
	}

	if (req.user.role !== "admin") {
		return next(new AppError("Access denied. This action requires administrator privileges", 403));
	}

	next();
};
