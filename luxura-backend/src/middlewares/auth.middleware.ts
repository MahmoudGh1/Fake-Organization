import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.model";
import { AppError } from "./error.middleware";
import { verifyApiKey, extractPrefix } from "../utils/apiKey";

// ─── JWT Payload Shape ───────────────────────────────────────────────────────
interface JwtPayload {
	id: string;
	email: string;
	role: "customer" | "admin";
	iat: number;
	exp: number;
}

// ─── Helper: extract Bearer token from Authorization header ─────────────────
const extractBearerToken = (req: Request): string | null => {
	const authHeader = req.headers.authorization;
	if (authHeader && authHeader.startsWith("Bearer ")) {
		return authHeader.substring(7);
	}
	return null;
};

// ─── Helper: extract JWT from cookie ────────────────────────────────────────
const extractCookieToken = (req: Request): string | null => {
	return req.cookies?.token ?? null;
};

// ─── Strategy 1: Authenticate via JWT ───────────────────────────────────────
const authenticateWithJWT = async (token: string, req: Request): Promise<boolean> => {
	try {
		const secret = process.env.JWT_SECRET;
		if (!secret) throw new AppError("JWT secret not configured", 500);

		const decoded = jwt.verify(token, secret) as JwtPayload;

		// Confirm user still exists in DB (handles deleted accounts mid-session)
		const user = await User.findById(decoded.id).select("_id email role");
		if (!user) return false;

		req.user = {
			id: user._id.toString(),
			email: user.email,
			role: user.role,
		};

		req.apiKeyUsed = false;
		return true;
	} catch {
		return false;
	}
};

// ─── Strategy 2: Authenticate via API Key ───────────────────────────────────
const authenticateWithApiKey = async (rawKey: string, req: Request): Promise<boolean> => {
	try {
		// Basic format validation
		if (!rawKey.startsWith("lxr_") || rawKey.length < 20) return false;

		// Extract prefix for fast indexed DB lookup
		const prefix = extractPrefix(rawKey);

		// Find the user who owns a key with this prefix
		const user = await User.findOne({
			"apiKeys.prefix": prefix,
		}).select("_id email role apiKeys");

		if (!user) return false;

		// Find the specific key sub-document by prefix
		const apiKeyDoc = user.apiKeys.find((k) => k.prefix === prefix);
		if (!apiKeyDoc) return false;

		// Check expiry
		if (new Date() > apiKeyDoc.expiresAt) return false;

		// bcrypt compare — verifies the raw key against the stored hash
		const isValid = await verifyApiKey(rawKey, apiKeyDoc.key);
		if (!isValid) return false;

		// ── Stamp last used (fire-and-forget, don't await to keep latency low) ──
		User.updateOne({ _id: user._id, "apiKeys.prefix": prefix }, { $set: { "apiKeys.$.lastUsedAt": new Date() } }).exec();

		req.user = {
			id: user._id.toString(),
			email: user.email,
			role: user.role,
		};

		req.apiKeyUsed = true;
		return true;
	} catch {
		return false;
	}
};

// ─── Main Middleware: Protect (JWT or API Key required) ──────────────────────
export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		// ── Try API Key first (x-api-key header) ──
		const apiKey = req.headers["x-api-key"] as string | undefined;
		if (apiKey) {
			const success = await authenticateWithApiKey(apiKey, req);
			if (success) return next();

			// Key was provided but invalid — fail immediately, don't fall through
			throw new AppError("Invalid or expired API key", 401);
		}

		// ── Try JWT (Bearer header or cookie) ──
		const token = extractBearerToken(req) ?? extractCookieToken(req);
		if (token) {
			const success = await authenticateWithJWT(token, req);
			if (success) return next();

			throw new AppError("Invalid or expired token. Please log in again", 401);
		}

		// ── No credentials at all ──
		throw new AppError("Authentication required. Provide a Bearer token, session cookie, or x-api-key header", 401);
	} catch (err) {
		next(err);
	}
};

// ─── Optional Auth: attaches user if token present, never throws
