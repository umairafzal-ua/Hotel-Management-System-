import { z } from "zod";

export const contactUsSchema = z.object({
    fullName: z
        .string({
            required_error: "Full name is required",
            invalid_type_error: "Full name must be a string",
        })
        .trim()
        .min(2, "Full name must be at least 2 characters")
        .max(100, "Full name must not exceed 100 characters"),
    
    email: z
        .string({
            required_error: "Email is required",
            invalid_type_error: "Email must be a string",
        })
        .trim()
        .toLowerCase()
        .email("Invalid email address")
        .max(100, "Email must not exceed 100 characters"),
    
    subject: z
        .string({
            required_error: "Subject is required",
            invalid_type_error: "Subject must be a string",
        })
        .trim()
        .min(3, "Subject must be at least 3 characters")
        .max(150, "Subject must not exceed 150 characters"),
    
    message: z
        .string({
            required_error: "Message is required",
            invalid_type_error: "Message must be a string",
        })
        .trim()
        .min(10, "Message must be at least 10 characters")
        .max(5000, "Message must not exceed 5000 characters"),

    recaptchaToken: z
        .string({
            required_error: "reCAPTCHA token is required",
            invalid_type_error: "reCAPTCHA token must be a string",
        })
        .min(1, "reCAPTCHA token is required"),
});

export const validate = (schema) => (req, res, next) => {
    try {
        const validatedData = schema.parse(req.body);
        req.validatedBody = validatedData;
        if (process.env.NODE_ENV === "development") {
            console.log("[Validation] Contact Us form validated successfully");
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
