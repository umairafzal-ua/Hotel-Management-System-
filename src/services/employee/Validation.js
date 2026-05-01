import { z } from "zod";

const objectIdSchema = z
    .string({
        required_error: "ID is required",
        invalid_type_error: "ID must be a string",
    })
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");

export const createEmployeeWithUserSchema = z.object({
    fullName: z.string().trim().min(2).max(100),
    email: z.string().email("Invalid email format"),
    phoneNumber: z.string().regex(/^\d{7,10}$/, "Phone must be 7-10 digits"),
    branchId: objectIdSchema,
    roleId: objectIdSchema,
    position: z.string().trim().min(1).max(100),
    department: z.string().trim().min(1).max(100),
    shift: z.string().trim().min(1).max(100),
    loginAllowed: z.boolean().optional().default(true),
});

export const assignEmployeeSchema = z.object({
    userId: objectIdSchema,
    branchId: objectIdSchema,
    roleId: objectIdSchema.optional(),
    position: z.string().trim().max(100).optional(),
    department: z.string().trim().max(100).optional(),
    shift: z.string().trim().max(100).optional(),
    isActive: z.boolean().optional().default(true),
    loginAllowed: z.boolean().optional().default(true),
});

export const updateEmployeeSchema = z
    .object({
        fullName: z.string().trim().min(2).max(100).optional(),
        email: z.string().email("Invalid email format").optional(),
        phoneNumber: z.string().regex(/^\d{7,10}$/, "Phone must be 7-10 digits").optional(),
        branchId: objectIdSchema.optional(),
        roleId: objectIdSchema.optional(),
        position: z.string().trim().max(100).optional(),
        department: z.string().trim().max(100).optional(),
        shift: z.string().trim().max(100).optional(),
        isActive: z.boolean().optional(),
        loginAllowed: z.boolean().optional(),
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
