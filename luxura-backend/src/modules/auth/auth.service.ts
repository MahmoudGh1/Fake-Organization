import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User, { IUser } from "../../models/User.model";
import { AppError } from "../../middlewares/error.middleware";
import { generateApiKey, extractPrefix } from "../../utils/apiKey";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface RegisterInput {
	name: string;
	email: string;
	password: string;
	role?: "customer" | "admin";
}

export interface LoginInput {
	email: string;
	password: string;
}

export interface AuthTokenPayload {
	id: string;
	email: string;
	role: "customer" | "admin";
}

export interface ApiKeyInput {
	label: string;
	expiresInDays?: number;
}

export interface SafeUser {
	id: string;
	name: string;
	email: string;
	role: "customer" | "admin";
	createdAt: Date;
}

export interface ApiKeyResult {
	prefix: string;
	label: string;
	expiresAt: Date;
	createdAt: Date;
	lastUsedAt: Date | null;
}

// ─── Helper: sign a standard short-lived session JWT ─────────────────────────
const signSessionJWT = (payload: AuthTokenPayload): string => {
	const secret = process.env.JWT_SECRET;
	if (!secret) throw new AppError("JWT secret is not configured", 500);

	return jwt.sign(payload, secret, {
		expiresIn: (process.env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"]) || "7d",
	});
};

// ─── Helper: strip sensitive fields for API responses ────────────────────────
const sanitizeUser = (user: IUser): SafeUser => ({
	id: user._id.toString(),
	name: user.name,
	email: user.email,
	role: user.role,
	createdAt: user.createdAt,
});

// ─── Register ─────────────────────────────────────────────────────────────────
export const registerUser = async (input: RegisterInput): Promise<{ user: SafeUser; token: string }> => {
	const { name, email, password, role } = input;

	// Check for existing account
	const existing = await User.findOne({ email });
	if (existing) {
		throw new AppError("An account with this email already exists", 409);
	}

	const user = await User.create({ name, email, password, role });

	const token = signSessionJWT({
		id: user._id.toString(),
		email: user.email,
		role: user.role,
	});

	return { user: sanitizeUser(user), token };
};

// ─── Login ────────────────────────────────────────────────────────────────────
export const loginUser = async (input: LoginInput): Promise<{ user: SafeUser; token: string }> => {
	const { email, password } = input;

	// Explicitly select password since it has select: false on the schema
	const user = await User.findOne({ email }).select("+password");
	if (!user) {
		// Generic message — never reveal whether email exists
		throw new AppError("Invalid email or password", 401);
	}

	const isMatch = await user.comparePassword(password);
	if (!isMatch) {
		throw new AppError("Invalid email or password", 401);
	}

	const token = signSessionJWT({
		id: user._id.toString(),
		email: user.email,
		role: user.role,
	});

	return { user: sanitizeUser(user), token };
};

// ─── Get Current User ─────────────────────────────────────────────────────────
export const getCurrentUser = async (userId: string): Promise<SafeUser> => {
	if (!mongoose.Types.ObjectId.isValid(userId)) {
		throw new AppError("Invalid user ID", 400);
	}

	const user = await User.findById(userId).select("-apiKeys");
	if (!user) {
		throw new AppError("User not found", 404);
	}

	return sanitizeUser(user);
};

// ─── Generate API Key ─────────────────────────────────────────────────────────
export const createApiKey = async (userId: string, input: ApiKeyInput): Promise<{ rawKey: string; keyInfo: ApiKeyResult }> => {
	const { label, expiresInDays = 90 } = input;

	if (!mongoose.Types.ObjectId.isValid(userId)) {
		throw new AppError("Invalid user ID", 400);
	}

	const user = await User.findById(userId);
	if (!user) {
		throw new AppError("User not found", 404);
	}

	// Enforce a max of 10 active API keys per user
	if (user.apiKeys.length >= 10) {
		throw new AppError("Maximum of 10 API keys allowed per account. Please revoke an existing key first", 400);
	}

	// Prevent duplicate labels
	const labelExists = user.apiKeys.some((k) => k.label.toLowerCase() === label.toLowerCase());
	if (labelExists) {
		throw new AppError(`An API key with the label "${label}" already exists`, 409);
	}

	// Generate the key
	const { raw, hashed, prefix } = await generateApiKey();

	const expiresAt = new Date();
	expiresAt.setDate(expiresAt.getDate() + expiresInDays);

	// Push to user's apiKeys array
	user.apiKeys.push({
		key: hashed,
		prefix,
		label,
		createdAt: new Date(),
		expiresAt,
		lastUsedAt: undefined,
	});

	await user.save();

	const savedKey = user.apiKeys[user.apiKeys.length - 1];

	return {
		rawKey: raw,
		keyInfo: {
			prefix: savedKey.prefix,
			label: savedKey.label,
			expiresAt: savedKey.expiresAt,
			createdAt: savedKey.createdAt,
			lastUsedAt: savedKey.lastUsedAt ?? null,
		},
	};
};

// ─── List API Keys ─────────────────────────────────────────────────────────────
export const listApiKeys = async (userId: string): Promise<ApiKeyResult[]> => {
	if (!mongoose.Types.ObjectId.isValid(userId)) {
		throw new AppError("Invalid user ID", 400);
	}

	const user = await User.findById(userId).select("apiKeys");
	if (!user) {
		throw new AppError("User not found", 404);
	}

	return user.apiKeys.map((k) => ({
		prefix: k.prefix,
		label: k.label,
		expiresAt: k.expiresAt,
		createdAt: k.createdAt,
		lastUsedAt: k.lastUsedAt ?? null,
	}));
};

// ─── Revoke API Key ────────────────────────────────────────────────────────────
export const revokeApiKey = async (userId: string, prefix: string): Promise<void> => {
	if (!mongoose.Types.ObjectId.isValid(userId)) {
		throw new AppError("Invalid user ID", 400);
	}

	const user = await User.findById(userId).select("apiKeys");
	if (!user) {
		throw new AppError("User not found", 404);
	}

	const keyIndex = user.apiKeys.findIndex((k) => k.prefix === prefix);
	if (keyIndex === -1) {
		throw new AppError("API key not found", 404);
	}

	user.apiKeys.splice(keyIndex, 1);
	await user.save();
};
