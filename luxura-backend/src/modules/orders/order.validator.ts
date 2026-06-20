import { body, param } from "express-validator";

export const placeOrderValidator = [
	body("items").notEmpty().withMessage("Order items are required").isArray({ min: 1 }).withMessage("Order must contain at least one item"),

	body("items.*.productId").notEmpty().withMessage("Product ID is required for each item").isMongoId().withMessage("Each product ID must be a valid MongoDB ObjectId"),

	body("items.*.quantity").notEmpty().withMessage("Quantity is required for each item").isInt({ min: 1 }).withMessage("Quantity must be at least 1").toInt(),

	// ── Shipping Address ──
	body("shippingAddress").notEmpty().withMessage("Shipping address is required").isObject().withMessage("Shipping address must be an object"),

	body("shippingAddress.fullName").trim().notEmpty().withMessage("Full name is required"),

	body("shippingAddress.addressLine1").trim().notEmpty().withMessage("Address line 1 is required"),

	body("shippingAddress.addressLine2").optional().trim(),

	body("shippingAddress.city").trim().notEmpty().withMessage("City is required"),

	body("shippingAddress.state").trim().notEmpty().withMessage("State is required"),

	body("shippingAddress.postalCode").trim().notEmpty().withMessage("Postal code is required"),

	body("shippingAddress.country").trim().notEmpty().withMessage("Country is required"),

	body("shippingAddress.phone")
		.trim()
		.notEmpty()
		.withMessage("Phone number is required")
		.matches(/^\+?[1-9]\d{6,14}$/)
		.withMessage("Please provide a valid phone number"),

	body("notes").optional().trim().isLength({ max: 500 }).withMessage("Notes cannot exceed 500 characters"),
];

export const updateOrderStatusValidator = [
	param("id").notEmpty().withMessage("Order ID is required").isMongoId().withMessage("Order ID must be a valid MongoDB ObjectId"),

	body("status").notEmpty().withMessage("Status is required").isIn(["Pending", "Processing", "Shipped", "Delivered", "Cancelled"]).withMessage("Status must be one of: Pending, Processing, Shipped, Delivered, Cancelled"),

	body("notes").optional().trim().isLength({ max: 500 }).withMessage("Notes cannot exceed 500 characters"),
];

export const orderIdValidator = [param("id").notEmpty().withMessage("Order ID is required").isMongoId().withMessage("Order ID must be a valid MongoDB ObjectId")];
