import { Router } from "express";
import * as orderController from "./order.controller";
import { protect } from "../../middlewares/auth.middleware";
import { requireAdmin } from "../../middlewares/admin.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { placeOrderValidator, updateOrderStatusValidator, orderIdValidator } from "./order.validator";

const router = Router();

// All order routes require authentication
router.use(protect);

// ─── Customer + Admin Routes ──────────────────────────────────────────────────

// POST /api/orders
router.post("/", validate(placeOrderValidator), orderController.placeOrder);

// GET /api/orders/user  ← must be before /:id
router.get("/user", orderController.getUserOrders);

// GET /api/orders/:id  ← ownership enforced inside service
router.get("/:id", validate(orderIdValidator), orderController.getOrder);

// DELETE /api/orders/:id  ← cancel (ownership enforced inside service)
router.delete("/:id", validate(orderIdValidator), orderController.cancelOrder);

// ─── Admin Only Routes ────────────────────────────────────────────────────────

// GET /api/orders/admin  ← all orders with optional status filter
router.get("/admin", requireAdmin, orderController.getAllOrders);

// GET /api/orders/stats
router.get("/stats", requireAdmin, orderController.getOrderStats);

// PUT /api/orders/:id  ← status update
router.put("/:id", requireAdmin, validate(updateOrderStatusValidator), orderController.updateOrderStatus);

export default router;
