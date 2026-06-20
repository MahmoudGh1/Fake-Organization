import { Request, Response, NextFunction } from "express";
import * as authService from "./auth.service.js";

// ─── Cookie config ────────────────────────────────────────────────────────────
const COOKIE_OPTIONS = {
	httpOnly: true, // not accessible via JS
	secure: process.env.NODE_ENV === "production", // HTTPS only in prod
	sameSite: "lax" as const,
	maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

// ─── POST /api/auth/register ─────────────────────────────────────────────────
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const { name, email, password, role } = req.body;
		const { user, token } = await authService.registerUser({
			name,
			email,
			password,
			role,
		});

		res.cookie("token", token, COOKIE_OPTIONS);

		res.status(201).json({
			success: true,
			message: "Account created successfully",
			data: { user, token },
		});
	} catch (err) {
		next(err);
	}
};

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const { email, password } = req.body;
		const { user, token } = await authService.loginUser({ email, password });

		res.cookie("token", token, COOKIE_OPTIONS);

		res.status(200).json({
			success: true,
			message: "Logged in successfully",
			data: { user, token },
		});
	} catch (err) {
		next(err);
	}
};

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
export const logout = (_req: Request, res: Response): void => {
	res.clearCookie("token", {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
	});

	res.status(200).json({
		success: true,
		message: "Logged out successfully",
	});
};

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const user = await authService.getCurrentUser(req.user!.id);

		res.status(200).json({
			success: true,
			data: { user },
		});
	} catch (err) {
		next(err);
	}
};

// ─── POST /api/auth/api-keys ──────────────────────────────────────────────────
export const generateApiKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const { label, expiresInDays } = req.body;
		const { rawKey, keyInfo } = await authService.createApiKey(req.user!.id, {
			label,
			expiresInDays,
		});

		res.status(201).json({
			success: true,
			message: "API key generated successfully. Copy it now — it will not be shown again.",
			data: {
				apiKey: rawKey, // ← shown ONCE, never stored in plain text
				...keyInfo,
			},
		});
	} catch (err) {
		next(err);
	}
};

// ─── GET /api/auth/api-keys ───────────────────────────────────────────────────
export const getApiKeys = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const keys = await authService.listApiKeys(req.user!.id);

		res.status(200).json({
			success: true,
			data: { keys },
		});
	} catch (err) {
		next(err);
	}
};

// ─── DELETE /api/auth/api-keys/:prefix ───────────────────────────────────────
export const deleteApiKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const { prefix } = req.params as { prefix: string };
		await authService.revokeApiKey(req.user!.id, prefix);

		res.status(200).json({
			success: true,
			message: "API key revoked successfully",
		});
	} catch (err) {
		next(err);
	}
};
