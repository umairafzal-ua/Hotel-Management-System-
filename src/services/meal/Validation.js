import { z } from "zod";

const objectId = z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");

const timeWindow = z
    .object({
        start: z.string().optional().default(""),
        end: z.string().optional().default(""),
    })
    .optional()
    .default({});

const mealEntry = z.object({
    type: z.enum(["breakfast", "lunch", "dinner"]),
    enabled: z.boolean().optional().default(true),
    defaultTimeWindow: timeWindow,
    defaultMenuId: objectId.nullable().optional().default(null),
});

export const createMealPlanSchema = z.object({
    branchId: objectId.nullable().optional().default(null),
    name: z.string().trim().min(2).max(100),
    isActive: z.boolean().optional().default(true),
    unitMode: z.enum(["per_person", "per_room", "hybrid"]).optional().default("hybrid"),
    meals: z.array(mealEntry).optional().default([]),
    rules: z.any().optional().default({}),
});

export const updateMealPlanSchema = z
    .object({
        name: z.string().trim().min(2).max(100).optional(),
        isActive: z.boolean().optional(),
        unitMode: z.enum(["per_person", "per_room", "hybrid"]).optional(),
        meals: z.array(mealEntry).optional(),
        rules: z.any().optional(),
        branchId: objectId.nullable().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field must be provided for update",
    });

const selectionMeal = z.object({
    enabled: z.boolean().optional().default(false),
    quantityOverride: z.number().int().min(0).nullable().optional().default(null),
    scheduleOverride: timeWindow,
});

export const upsertMealSelectionSchema = z.object({
    mealPlanId: objectId.nullable().optional().default(null),
    unitMode: z.enum(["per_person", "per_room", "hybrid"]).optional().default("hybrid"),
    meals: z
        .object({
            breakfast: selectionMeal.optional(),
            lunch: selectionMeal.optional(),
            dinner: selectionMeal.optional(),
        })
        .optional()
        .default({}),
    preferences: z
        .object({
            diet: z.enum(["veg", "non_veg", "unspecified"]).optional().default("unspecified"),
            spiceLevel: z.enum(["mild", "medium", "hot", "unspecified"]).optional().default("unspecified"),
            allergies: z.array(z.string()).optional().default([]),
            religiousNotes: z.string().optional().default(""),
            notes: z.string().optional().default(""),
        })
        .optional()
        .default({}),
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

