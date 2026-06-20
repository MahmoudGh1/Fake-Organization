import { body, query, param } from "express-validator";

export const createProductValidator = [
	body("name").trim().notEmpty().withMessage("Product name is required").isLength({ min: 2, max: 120 }).withMessage("Name must be between 2 and 120 characters"),

	body("description").trim().notEmpty().withMessage("Description is required").isLength({ min: 10, max: 2000 }).withMessage("Description must be between 10 and 2000 characters"),

	body("price").notEmpty().withMessage("Price is required").isFloat({ min: 0 }).withMessage("Price must be a positive number").toFloat(),

	body("luxuryCategory").notEmpty().withMessage("Category is required").isIn(["Living Room", "Bedroom", "Dining", "Office", "Outdoor", "Accessories"]).withMessage("Category must be one of: Living Room, Bedroom, Dining, Office, Outdoor, Accessories"),

	body("images").optional().isArray({ max: 10 }).withMessage("Images must be an array of up to 10 URLs"),

	body("images.*").optional().isURL().withMessage("Each image must be a valid URL"),

	body("stock").notEmpty().withMessage("Stock is required").isInt({ min: 0 }).withMessage("Stock must be a non-negative integer").toInt(),

	body("dimensions").notEmpty().withMessage("Dimensions are required").isObject().withMessage("Dimensions must be an object"),

	body("dimensions.width").notEmpty().withMessage("Width is required").isFloat({ min: 0 }).withMessage("Width must be a positive number").toFloat(),

	body("dimensions.height").notEmpty().withMessage("Height is required").isFloat({ min: 0 }).withMessage("Height must be a positive number").toFloat(),

	body("dimensions.depth").notEmpty().withMessage("Depth is required").isFloat({ min: 0 }).withMessage("Depth must be a positive number").toFloat(),

	body("dimensions.weight").optional().isFloat({ min: 0 }).withMessage("Weight must be a positive number").toFloat(),

	body("sku").optional().trim().isLength({ min: 3, max: 40 }).withMessage("SKU must be between 3 and 40 characters"),
];

export const updateProductValidator = [
	body("name").optional().trim().isLength({ min: 2, max: 120 }).withMessage("Name must be between 2 and 120 characters"),

	body("description").optional().trim().isLength({ min: 10, max: 2000 }).withMessage("Description must be between 10 and 2000 characters"),

	body("price").optional().isFloat({ min: 0 }).withMessage("Price must be a positive number").toFloat(),

	body("luxuryCategory").optional().isIn(["Living Room", "Bedroom", "Dining", "Office", "Outdoor", "Accessories"]).withMessage("Category must be one of: Living Room, Bedroom, Dining, Office, Outdoor, Accessories"),

	body("images").optional().isArray({ max: 10 }).withMessage("Images must be an array of up to 10 URLs"),

	body("images.*").optional().isURL().withMessage("Each image must be a valid URL"),

	body("stock").optional().isInt({ min: 0 }).withMessage("Stock must be a non-negative integer").toInt(),

	body("dimensions.width").optional().isFloat({ min: 0 }).withMessage("Width must be a positive number").toFloat(),

	body("dimensions.height").optional().isFloat({ min: 0 }).withMessage("Height must be a positive number").toFloat(),

	body("dimensions.depth").optional().isFloat({ min: 0 }).withMessage("Depth must be a positive number").toFloat(),

	body("dimensions.weight").optional().isFloat({ min: 0 }).withMessage("Weight must be a positive number").toFloat(),

	body("isActive").optional().isBoolean().withMessage("isActive must be a boolean").toBoolean(),
];

export const listProductsValidator = [
	query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer").toInt(),

	query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100").toInt(),

	query("minPrice").optional().isFloat({ min: 0 }).withMessage("minPrice must be a positive number").toFloat(),

	query("maxPrice").optional().isFloat({ min: 0 }).withMessage("maxPrice must be a positive number").toFloat(),

	query("category").optional().isIn(["Living Room", "Bedroom", "Dining", "Office", "Outdoor", "Accessories"]).withMessage("Invalid category"),

	query("sortBy").optional().isIn(["price", "-price", "name", "-name", "createdAt", "-createdAt"]).withMessage("sortBy must be one of: price, -price, name, -name, createdAt, -createdAt"),

	query("search").optional().trim().isLength({ min: 1, max: 100 }).withMessage("Search query must be between 1 and 100 characters"),

	query("inStock").optional().isBoolean().withMessage("inStock must be true or false").toBoolean(),
];

export const productIdValidator = [param("id").notEmpty().withMessage("Product ID is required").isMongoId().withMessage("Product ID must be a valid MongoDB ObjectId")];
