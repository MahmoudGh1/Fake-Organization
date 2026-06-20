import { Router } from "express";
import * as authController from "./auth.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { registerValidator, loginValidator, apiKeyValidator } from "./auth.validator.js";

const router = Router();

// ─── Public ───────────────────────────────────────────────────────────────────
router.post("/register", validate(registerValidator), authController.register);
router.post("/login", validate(loginValidator), authController.login);
router.post("/logout", authController.logout);

// ─── Protected (session JWT or API Key) ──────────────────────────────────────
router.get("/me", protect, authController.getMe);

// ─── API Key Management (protected) ──────────────────────────────────────────
router.post("/api-keys", protect, validate(apiKeyValidator), authController.generateApiKey);
router.get("/api-keys", protect, authController.getApiKeys);
router.delete("/api-keys/:prefix", protect, authController.deleteApiKey);

export default router;
