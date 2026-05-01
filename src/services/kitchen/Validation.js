import { z } from "zod";

const objectId = z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");

export const kitchenPrepQuerySchema = z.object({
    branchId: objectId,
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
});

export const createAdjustmentSchema = z.object({
    branchId: objectId,
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
    mealType: z.enum(["breakfast", "lunch", "dinner"]),
    deltaQuantity: z.number().int(),
    reason: z.string().trim().optional().default(""),
    bookingId: objectId.optional(),
});

export const validateQuery = (schema) => (req, res, next) => {
    try {
        req.validatedQuery = schema.parse(req.query);
        next();
    } catch (error) {
        if (error instanceof z.ZodError && error.issues) {
            const errors = error.issues.map((err) => ({
                field: err.path.join(".") || "root",
                message: err.message,
            }));
            return res.status(400).json({
                statusCode: 400,
                success: false,
                message: "Query validation failed",
                errors,
                data: null,
            });
        }
        next(error);
    }
};

export const validate = (schema) => (req, res, next) => {
    try {
        req.validatedBody = schema.parse(req.body);
        next();
    } catch (error) {
        if (error instanceof z.ZodError && error.issues) {
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

