import crypto from "crypto";
import bcrypt from "bcrypt";

export interface GeneratedApiKey {
	raw: string; // shown ONCE to the user, never stored
	hashed: string; // stored in MongoDB
	prefix: string; // first 8 chars after "lxr_" — used for lookup
}

/**
 * Generates a secure, prefixed API key.
 *
 * Format:  lxr_<8-char-prefix><48-char-random>
 * Example: lxr_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
 *
 * Only `raw` is returned to the user at creation time.
 * Only `hashed` and `prefix` are persisted in the database.
 */
export const generateApiKey = async (): Promise<GeneratedApiKey> => {
	// 48 random bytes → 64 hex chars (cryptographically secure)
	const randomPart = crypto.randomBytes(48).toString("hex");
	const raw = `lxr_${randomPart}`;

	// prefix = "lxr_" + first 8 hex chars — enough to identify the key
	const prefix = `lxr_${randomPart.substring(0, 8)}`;

	// Hash with bcrypt cost 10 (balance of security vs latency on each request)
	const salt = await bcrypt.genSalt(10);
	const hashed = await bcrypt.hash(raw, salt);

	return { raw, hashed, prefix };
};

/**
 * Verifies a raw incoming key against a stored bcrypt hash.
 */
export const verifyApiKey = async (rawKey: string, storedHash: string): Promise<boolean> => {
	return bcrypt.compare(rawKey, storedHash);
};

/**
 * Extracts the prefix from a raw API key for fast DB lookup.
 * Instead of comparing against every key in the DB, we first
 * filter by prefix (indexed), then bcrypt-compare only that one record.
 */
export const extractPrefix = (rawKey: string): string => {
	// "lxr_a1b2c3d4rest..." → "lxr_a1b2c3d4"
	return rawKey.substring(0, 12); // "lxr_" (4) + 8 hex chars
};
