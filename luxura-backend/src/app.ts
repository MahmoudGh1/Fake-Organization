import express, { Application } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import { connectDB } from "./config/db.js";
import { setupSwagger } from "./config/swagger.js";
import { errorHandler } from "./middlewares/error.middleware.js";

// Route imports
import authRoutes from "./modules/auth/auth.routes.js";
import productRoutes from "./modules/products/product.routes.js";
import orderRoutes from "./modules/orders/order.routes.js";

dotenv.config();

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
