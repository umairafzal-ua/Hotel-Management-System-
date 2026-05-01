import { z } from "zod";

const requiredString = (field) =>
    z.string({
        required_error: `${field} is required`,
        invalid_type_error: `${field} must be a string`,
    });

const partyTypeEnum = z.enum(["individual", "couple", "group"], {
    errorMap: () => ({ message: "Party type must be one of: individual, couple, group" }),
});

const genderEnum = z.enum(["male", "female", "mixed"], {
    errorMap: () => ({ message: "Gender must be one of: male, female, mixed" }),
});

const bookingStatusEnum = z.enum(["confirmed", "cancelled", "reassigned", "completed"], {
    errorMap: () => ({ message: "Status must be one of: confirmed, cancelled, reassigned, completed" }),
});

export const createBookingSchema = z.object({
    roomId: requiredString("Room ID").min(1),
    checkInDate: requiredString("Check-in date"),
    checkOutDate: requiredString("Check-out date"),
    partyType: partyTypeEnum,
    guestCount: z.coerce.number({
        required_error: "Guest count is required",
        invalid_type_error: "Guest count must be a number",
    }).int().min(1),
    gender: genderEnum.optional().default("mixed"),
    customer: z.object({
        name: requiredString("Customer name").min(2).max(100),
        email: z.string().email("Customer email must be a valid email").optional(),
        phone: z.string().min(6).max(20).optional(),
    }),
    notes: z.string().max(500).optional(),
});

export const customerCreateBookingSchema = z.object({
    roomId: requiredString("Room ID").min(1),
    checkInDate: requiredString("Check-in date"),
    checkOutDate: requiredString("Check-out date"),
    guestCount: z.coerce.number({
        required_error: "Guest count is required",
        invalid_type_error: "Guest count must be a number",
    }).int().min(1),
    partyType: partyTypeEnum.optional(),
    gender: genderEnum.optional(),
    customer: z.object({
        name: requiredString("Customer name").min(2).max(100).optional(),
        email: z.string().email("Customer email must be a valid email").optional(),
        phone: z.string().min(6).max(20).optional(),
    }).optional(),
    notes: z.string().max(500).optional(),
});

export const cancelBookingSchema = z.object({
    reason: z.string().max(255).optional(),
});

export const reassignBookingSchema = z.object({
    newRoomId: requiredString("New room ID").min(1),
    checkInDate: z.string().optional(),
    checkOutDate: z.string().optional(),
    notes: z.string().max(500).optional(),
});

export const updateBookingSchema = z.object({
    checkInDate: z.string().optional(),
    checkOutDate: z.string().optional(),
    guestCount: z.coerce.number().int().min(1).optional(),
    partyType: partyTypeEnum.optional(),
    gender: genderEnum.optional(),
    customer: z.object({
        name: z.string().min(2).max(100).optional(),
        email: z.string().email("Must be a valid email").optional(),
        phone: z.string().min(6).max(20).optional(),
    }).optional(),
    notes: z.string().max(500).optional(),
});

export const listBookingsQuerySchema = z.object({
    branchId: z.string().optional(),
    roomId: z.string().optional(),
    status: bookingStatusEnum.optional(),
    fromDate: z.string().optional(),
    toDate: z.string().optional(),
    q: z.string().trim().optional(),
    search: z.string().trim().optional(),
    page: z.coerce.number().int().min(1).optional().default(1),
    per_page: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export const validate = (schema) => (req, res, next) => {
    try {
        const validatedData = schema.parse(req.body);
        req.validatedBody = validatedData;
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

export const validateQuery = (schema) => (req, res, next) => {
    try {
        const validatedQuery = schema.parse(req.query);
        req.validatedQuery = validatedQuery;
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
