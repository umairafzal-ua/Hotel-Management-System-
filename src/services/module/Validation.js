import { z } from "zod";

// Custom error messages
const requiredString = (field) => z.string({
    required_error: `${field} is required`,
    invalid_type_error: `${field} must be a string`,
});

// Module Schema
export const moduleSchema = z.object({
    name: requiredString("Module name")
        .min(2, "Module name must be at least 2 characters")
        .max(50, "Module name must not exceed 50 characters"),
    code: z.string().trim().min(2).max(64).optional(),
    description: z.string().max(255, "Description must not exceed 255 characters").optional(),
    isActive: z.boolean().optional().default(true),
});

// Update Module Schema
export const updateModuleSchema = z.object({
    name: requiredString("Module name")
        .min(2, "Module name must be at least 2 characters")
        .max(50, "Module name must not exceed 50 characters")
        .optional(),
    code: z.string().trim().min(2).max(64).optional(),
    description: z.string().max(255, "Description must not exceed 255 characters").optional(),
    isActive: z.boolean().optional(),
}).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
});

// Validation middleware factory
export const validate = (schema) => (req, res, next) => {
    try {
        const validatedData = schema.parse(req.body);
        req.validatedBody = validatedData;
        console.log("[Validation] Success for:", Object.keys(validatedData).join(", "));
        next();
    } catch (error) {
        if (error instanceof z.ZodError && error.issues) {
            console.error("[Validation Error]:", error.issues);
            const errors = error.issues.map((err) => ({
                field: err.path.join(".") || "root",
                message: err.message,
            }));
            return res.status(400).json({
                statusCode: 400,
                success: false,
                message: "Validation failed",
                errors,
                data: null,
            });
        }
        next(error);
    }
};
