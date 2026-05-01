import { z } from "zod";

// Custom error messages
const requiredString = (field) => z.string({
    required_error: `${field} is required`,
    invalid_type_error: `${field} must be a string`,
});

// Permission Schema
export const permissionSchema = z.object({
    module: requiredString("Module ID"),
    action: z.enum(["create", "read", "update", "delete", "execute"], {
        required_error: "Action is required",
        invalid_type_error: "Invalid action",
    }),
    description: z.string().max(255, "Description must not exceed 255 characters").optional(),
    isActive: z.boolean().optional().default(true),
});

// Create Permissions Bulk Schema
export const createPermissionsBulkSchema = z.object({
    permissions: z.array(
        z.object({
            module: requiredString("Module ID"),
            action: z.enum(["create", "read", "update", "delete", "execute"]),
            description: z.string().optional(),
        })
    ).min(1, "At least one permission must be provided"),
});

// Update Permission Schema
export const updatePermissionSchema = z.object({
    action: z.enum(["create", "read", "update", "delete", "execute"]).optional(),
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
