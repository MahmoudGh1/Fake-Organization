import mongoose from "mongoose";

declare global {
	namespace Express {
		interface Request {
			user?: {
				id: string;
				email: string;
				role: "customer" | "admin";
			};
			apiKeyUsed?: boolean; // true when request authenticated via x-api-key header
		}
	}
}

export {};
