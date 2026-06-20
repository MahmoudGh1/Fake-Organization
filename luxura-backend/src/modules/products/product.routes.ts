import { Router } from "express";
import * as productController from "./product.controller";
import { protect } from "../../middlewares/auth.middleware";
import { requireAdmin } from "../../middlewares/admin.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { createProductValidator, updateProductValidator, listProductsValidator, productIdValidator } from "./product.validator";

const router = Router();

// ─── Public Routes ────────────────────────────────────────────────────────────

// GET /api/products?page=1&limit=12&category=Bedroom&minPrice=500&sortBy=-price&search=sofa
router.get("/", validate(listProductsValidator), productController.listProducts);

// GET /api/products/stats  ← must be before /:id to avoid "stats" being treated as an ID
router.get("/stats", protect, requireAdmin, productController.getProductStats);

// GET /api/products/:id
router.get("/:id", validate(productIdValidator), productController.getProduct);

// ─── Admin Protected Routes ───────────────────────────────────────────────────

// POST /api/products
router.post("/", protect, requireAdmin, validate(createProductValidator), productController.createProduct);

// PUT /api/products/:id
router.put("/:id", protect, requireAdmin, validate([...productIdValidator, ...updateProductValidator]), productController.updateProduct);

// DELETE /api/products/:id?permanent=true
router.delete("/:id", protect, requireAdmin, validate(productIdValidator), productController.deleteProduct);

export default router;
