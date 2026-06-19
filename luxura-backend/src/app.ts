import express, { Application } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import * as SupportNest from "supportnest-server-sdk"

import { connectDB } from "./config/db";
import { setupSwagger } from "./config/swagger";
import { errorHandler } from "./middlewares/error.middleware";

// Route imports
import authRoutes from "./modules/auth/auth.routes";
import productRoutes from "./modules/products/product.routes";
import orderRoutes from "./modules/orders/order.routes";

dotenv.config();

const client = SupportNest.init("48bcbd5904bd9a3cc09abe0ba7f470878a8f58f3bb33aeb4f8b5c22737cc223b");

const app: Application = express();

// ─── Core Middleware ────────────────────────────────────────────────────────
app.use(
	cors({
		origin: process.env.CLIENT_URL || "http://localhost:3000",
		credentials: true,
	}),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// ─── API Routes ────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// ─── Swagger Docs ──────────────────────────────────────────────────────────
setupSwagger(app);

// ─── Health Check ──────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
	res.json({ status: "ok", service: "Luxura API", timestamp: new Date().toISOString() });
});

// ─── generate widget token ──────────────────────────────────────────────────────────
app.get("/api/generate-widget-token", async (req, res) => {
    const token = await client.generateToken({
        userId: "12345",
        email: "user@example.com",
    });
    res.status(200).json({ token });
});

// ─── Global Error Handler ──────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const start = async () => {
	await connectDB();
	app.listen(PORT, () => {
		console.log(`\n🚀 Luxura API running on http://localhost:${PORT}`);
		console.log(`📚 Swagger Docs at  http://localhost:${PORT}/api/docs\n`);
	});
};

start();

export default app;
