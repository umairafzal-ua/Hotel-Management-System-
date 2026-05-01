import { z } from "zod";

// Custom error messages
const requiredString = (field) => z.string({
    required_error: `${field} is required`,
    invalid_type_error: `${field} must be a string`,
});

// Role Schema
export const roleSchema_create = z.object({
    name: requiredString("Role name")
        .min(2, "Role name must be at least 2 characters")
        .max(50, "Role name must not exceed 50 characters"),
    slug: z.string().trim().min(1).max(50).optional(),
    label: z.string().trim().max(100).optional(),
    description: z.string().max(255, "Description must not exceed 255 characters").optional(),
    permissions: z.array(requiredString("Permission ID")).optional().default([]),
    isActive: z.boolean().optional().default(true),
});

// Update Role Schema
export const updateRoleSchema = z.object({
    name: requiredString("Role name")
        .min(2, "Role name must be at least 2 characters")
        .max(50, "Role name must not exceed 50 characters")
        .optional(),
    slug: z.string().trim().min(1).max(50).optional(),
    label: z.string().trim().max(100).optional(),
    description: z.string().max(255, "Description must not exceed 255 characters").optional(),
    permissions: z.array(requiredString("Permission ID")).optional(),
    isActive: z.boolean().optional(),
}).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
});

// Add Permissions to Role Schema
export const addPermissionsToRoleSchema = z.object({
    roleId: requiredString("Role ID"),
    permissionIds: z.array(
        requiredString("Permission ID"),
        {
            required_error: "Permission IDs are required",
            invalid_type_error: "Permission IDs must be an array",
        }
    ).min(1, "At least one permission ID must be provided"),
});

// Remove Permissions from Role Schema
export const removePermissionsFromRoleSchema = z.object({
    roleId: requiredString("Role ID"),
    permissionIds: z.array(
        requiredString("Permission ID"),
        {
            required_error: "Permission IDs are required",
            invalid_type_error: "Permission IDs must be an array",
        }
    ).min(1, "At least one permission ID must be provided"),
});

// Set Permissions for Role Schema (bulk replace)
export const setPermissionsForRoleSchema = z.object({
    roleId: requiredString("Role ID"),
    permissionIds: z.array(
        requiredString("Permission ID"),
        {
            required_error: "Permission IDs are required",
            invalid_type_error: "Permission IDs must be an array",
        }
    ),
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
