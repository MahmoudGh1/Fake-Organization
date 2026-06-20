import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

// ─── App Error Class ─────────────────────────────────────────────────────────
export class AppError extends Error {
	statusCode: number;
	isOperational: boolean;

	constructor(message: string, statusCode: number) {
		super(message);
		this.statusCode = statusCode;
		this.isOperational = true;
		Error.captureStackTrace(this, this.constructor);
	}
}

// ─── Error Response Shape ────────────────────────────────────────────────────
interface ErrorResponse {
	success: false;
	message: string;
	errors?: unknown;
	stack?: string;
}

// ─── Global Error Handler ────────────────────────────────────────────────────
export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
	let statusCode = 500;
	let message = "Internal Server Error";
	let errors: unknown;

	// ── Operational errors we threw intentionally ──
	if (err instanceof AppError) {
		statusCode = err.statusCode;
		message = err.message;
	}

	// ── Mongoose: duplicate key (e.g. unique email) ──
	else if ((err as NodeJS.ErrnoException).name === "MongoServerError") {
		const mongoErr = err as NodeJS.ErrnoException & { code?: number; keyValue?: Record<string, string> };
		if (mongoErr.code === 11000 && mongoErr.keyValue) {
			const field = Object.keys(mongoErr.keyValue)[0];
			statusCode = 409;
			message = `An account with that ${field} already exists`;
		}
	}

	// ── Mongoose: validation errors ──
	else if (err instanceof mongoose.Error.ValidationError) {
		statusCode = 400;
		message = "Validation failed";
		errors = Object.values(err.errors).map((e) => ({
			field: e.path,
			message: e.message,
		}));
	}

	// ── Mongoose: bad ObjectId cast ──
	else if (err instanceof mongoose.Error.CastError) {
		statusCode = 400;
		message = `Invalid ${err.path}: ${err.value} is not a valid ID`;
	}

	// ── JWT errors ──
	else if (err.name === "JsonWebTokenError") {
		statusCode = 401;
		message = "Invalid token. Please log in again";
	} else if (err.name === "TokenExpiredError") {
		statusCode = 401;
		message = "Your session has expired. Please log in again";
	}

	const response: ErrorResponse = {
		success: false,
		message,
	};

	if (errors !== undefined) {
		response.errors = errors;
	}

	if (process.env.NODE_ENV === "development") {
		response.stack = err.stack;
	}

	res.status(statusCode).json(response);
};
