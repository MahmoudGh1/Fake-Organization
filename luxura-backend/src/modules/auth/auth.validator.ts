import { body } from "express-validator";

export const registerValidator = [
	body("name").trim().notEmpty().withMessage("Name is required").isLength({ min: 2, max: 80 }).withMessage("Name must be between 2 and 80 characters"),

	body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Please provide a valid email address").normalizeEmail(),

	body("password")
		.notEmpty()
		.withMessage("Password is required")
		.isLength({ min: 8 })
		.withMessage("Password must be at least 8 characters")
		.matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
		.withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number"),

	body("role").optional().isIn(["customer", "admin"]).withMessage("Role must be either customer or admin"),
];

export const loginValidator = [body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Please provide a valid email address").normalizeEmail(), body("password").notEmpty().withMessage("Password is required")];

export const apiKeyValidator = [body("label").trim().notEmpty().withMessage("A label for this API key is required").isLength({ min: 2, max: 60 }).withMessage("Label must be between 2 and 60 characters"), body("expiresInDays").optional().isInt({ min: 30, max: 365 }).withMessage("Expiry must be between 30 and 365 days").toInt()];
