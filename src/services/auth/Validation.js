import { z } from "zod";

// Custom error messages
const requiredString = (field) => z.string({
    required_error: `${field} is required`,
    invalid_type_error: `${field} must be a string`,
});

// Password validation schema
const passwordSchema = requiredString("Password")
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must not exceed 128 characters")
    .refine(
        (val) => /[A-Z]/.test(val),
        "Password must contain at least one uppercase letter"
    )
    .refine(
        (val) => /[0-9]/.test(val),
        "Password must contain at least one number"
    );

// Phone number validation
const phoneSchema = requiredString("Phone number")
    .min(10, "Phone number must be at least 10 characters")
    .max(13, "Phone number must not be larger than 13 characters")
    .regex(/^(?:05[0-9]{8}|\+?\d{10,13})$/, "Please enter a valid phone number");

// Email validation
const emailSchema = requiredString("Email")
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim();

// Name validation
const nameSchema = requiredString("Full name")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .trim();

// Role validation
const roleSchema = requiredString("Role")
    .refine(
        (val) => ["admin", "customer", "groupleader"].includes(val.toLowerCase()),
        "Invalid role selected. Must be customer or groupleader"
    );

// Registration Schema
export const registerSchema = z.object({
    fullName: nameSchema,
    email: emailSchema,
    phoneNumber: phoneSchema,
    password: passwordSchema,
    confirmPassword: requiredString("Confirm password"),
    role: roleSchema,
   
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

// Login Schema
export const loginSchema = z.object({
    email: emailSchema,
    password: requiredString("Password").min(1, "Password is required"),
});

// Refresh Token Schema
export const refreshTokenSchema = z.object({
    refreshToken: requiredString("Refresh token").min(1, "Refresh token is required"),
});

// Change Password Schema
export const changePasswordSchema = z.object({
    currentPassword: requiredString("Current password").min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmNewPassword: requiredString("Confirm new password"),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords do not match",
    path: ["confirmNewPassword"],
}).refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
});

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
    email: emailSchema,
});

// Reset Password Schema
export const resetPasswordSchema = z.object({
    token: requiredString("Reset token").min(1, "Reset token is required"),
    newPassword: passwordSchema,
    confirmNewPassword: requiredString("Confirm new password"),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
});

// Verify OTP Schema
export const verifyOTPSchema = z.object({
    email: emailSchema,
    otp: requiredString("OTP")
        .length(6, "OTP must be exactly 6 digits")
        .regex(/^\d{6}$/, "OTP must contain only digits"),
});

export const verifyRegistrationOTPSchema = verifyOTPSchema;

export const resendRegistrationOTPSchema = z.object({
    email: emailSchema,
});

// Reset Password with OTP Schema
export const resetPasswordWithOTPSchema = z.object({
    email: emailSchema,
    otp: requiredString("OTP")
        .length(6, "OTP must be exactly 6 digits")
        .regex(/^\d{6}$/, "OTP must contain only digits"),
    newPassword: passwordSchema,
    confirmNewPassword: requiredString("Confirm new password"),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
});

// Update Profile Schema
export const updateProfileSchema = z.object({
    fullName: nameSchema.optional(),
    phoneNumber: phoneSchema.optional(),
}).refine((data) => data.fullName || data.phoneNumber, {
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
