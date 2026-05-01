import { z } from "zod";

export const createAmenitySchema = z.object({
    name: z.string({
        required_error: "Amenity name is required",
        invalid_type_error: "Amenity name must be a string",
    }).min(1, "Amenity name is required").max(100),
    description: z.string().max(500).optional().default(""),
    price: z.number({
        required_error: "Price is required",
        invalid_type_error: "Price must be a number",
    }).min(0, "Price cannot be negative"),
    branchId: z
        .string({
            invalid_type_error: "Branch ID must be a string",
        })
        .min(1, "Branch ID is required")
        .nullable()
        .optional(),
    isActive: z.boolean().optional().default(true),
});

export const updateAmenitySchema = z
    .object({
        name: z.string().min(1).max(100).optional(),
        description: z.string().max(500).optional(),
        price: z.number().min(0, "Price cannot be negative").optional(),
        isActive: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field must be provided for update",
    });

// Validation middleware
export const validate = (schema) => (req, res, next) => {
    try {
        const validatedData = schema.parse(req.body);
        req.validatedBody = validatedData;
        if (process.env.NODE_ENV === "development") {
            console.log("[Validation] Success for Amenity:", Object.keys(validatedData).join(", "));
        }
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
