import { z } from "zod";

const objectId = z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");

export const createAddOnSchema = z.object({
    branchId: objectId.nullable().optional().default(null),
    name: z.string().trim().min(2).max(100),
    description: z.string().trim().optional().default(""),
    pricingModel: z.enum(["fixed", "usage_based"]).optional().default("fixed"),
    unitLabel: z.string().trim().optional().default(""),
    price: z.number().optional().default(0),
    rate: z.number().optional().default(0),
    isMandatory: z.boolean().optional().default(false),
    isActive: z.boolean().optional().default(true),
});

export const updateAddOnSchema = z
    .object({
        branchId: objectId.nullable().optional(),
        name: z.string().trim().min(2).max(100).optional(),
        description: z.string().trim().optional(),
        pricingModel: z.enum(["fixed", "usage_based"]).optional(),
        unitLabel: z.string().trim().optional(),
        price: z.number().optional(),
        rate: z.number().optional(),
        isMandatory: z.boolean().optional(),
        isActive: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field must be provided for update",
    });

export const upsertAddOnSelectionSchema = z.object({
    items: z
        .array(
            z.object({
                addOnServiceId: objectId,
                quantity: z.number().int().min(1).optional().default(1),
                notes: z.string().trim().optional().default(""),
            })
        )
        .optional()
        .default([]),
});

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

