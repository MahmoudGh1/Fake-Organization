import { Request, Response, NextFunction } from "express";
import { ValidationChain, validationResult } from "express-validator";

/**
 * Accepts an array of express-validator chains.
 * Runs them all, then either passes to next() or returns 422 with errors.
 *
 * Usage in routes:
 *   router.post("/register", validate(registerValidator), authController.register);
 */
export const validate = (validations: ValidationChain[]) => {
	return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		// Run all validation chains in parallel
		await Promise.all(validations.map((v) => v.run(req)));

		const result = validationResult(req);

		if (result.isEmpty()) {
			return next();
		}

		const formattedErrors = result.array().map((err) => ({
			field: err.type === "field" ? err.path : "unknown",
			message: err.msg,
		}));

		res.status(422).json({
			success: false,
			message: "Validation failed",
			errors: formattedErrors,
		});
	};
};
