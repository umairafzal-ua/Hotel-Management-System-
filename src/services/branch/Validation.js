import { z } from "zod";

const requiredString = (field) =>
    z.string({
        required_error: `${field} is required`,
        invalid_type_error: `${field} must be a string`,
    });

const optionalTrimmedString = z.string().trim().optional();

const coordinatesSchema = z
    .object({
        lat: z.number().optional(),
        lng: z.number().optional(),
    })
    .optional();

const locationSchema = z
    .object({
        address: optionalTrimmedString,
        city: z.string().trim().optional().default("Makkah"),
        coordinates: coordinatesSchema,
    })
    .optional();

export const createBranchSchema = z.object({
    name: requiredString("Branch name").min(2).max(100),
    location: locationSchema,
    distanceFromHaram: z
        .number({
            required_error: "distanceFromHaram is required",
            invalid_type_error: "distanceFromHaram must be a number",
        })
        .positive("distanceFromHaram must be greater than 0"),
    isActive: z.boolean().optional().default(true),
});

export const updateBranchSchema = z
    .object({
        name: z.string().trim().min(2).max(100).optional(),
        location: locationSchema,
        distanceFromHaram: z.number().positive().optional(),
        isActive: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field must be provided for update",
    });

export const validate = (schema) => (req, res, next) => {
    try {
        const validatedData = schema.parse(req.body);
        req.validatedBody = validatedData;
        if (process.env.NODE_ENV === "development") {
            console.log("[Validation] Success for:", Object.keys(validatedData).join(", "));
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
