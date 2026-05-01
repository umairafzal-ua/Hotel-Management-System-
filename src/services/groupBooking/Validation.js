import { z } from "zod";

const requiredString = (field) =>
    z.string({
        required_error: `${field} is required`,
        invalid_type_error: `${field} must be a string`,
    });

// ── Step 1: Group Leader creates group ──
export const createGroupSchema = z.object({
    branchId: requiredString("Branch ID").min(1),
    groupName: requiredString("Group name").min(2).max(100),
    totalPilgrims: z
        .number({
            required_error: "Total pilgrims is required",
            invalid_type_error: "Total pilgrims must be a number",
        })
        .int()
        .min(2, "Total pilgrims must be at least 2"),
    checkInDate: requiredString("Check-in date"),
    checkOutDate: requiredString("Check-out date"),
    preferences: z
        .object({
            preferredRoomType: z
                .enum(["single", "double", "triple", "shared", "dormitory", "group", "quad", ""])
                .optional()
                .default(""),
            genderPolicy: z
                .enum(["male_only", "female_only", "mixed", ""])
                .optional()
                .default(""),
            notes: z.string().max(500).optional().default(""),
        })
        .optional()
        .default({}),
});

// ── Step 2: Branch Manager allocates rooms ──
export const allocateRoomsSchema = z.object({
    roomIds: z
        .array(
            requiredString("Room ID").min(1)
        )
        .min(1, "At least one room ID is required"),
});

// ── Step 3: Group Leader adds pilgrims ──
export const addMembersSchema = z.object({
    members: z
        .array(
            z.object({
                fullName: requiredString("Full name").min(2).max(100),
                gender: z.enum(["male", "female"], {
                    errorMap: () => ({ message: "Gender must be male or female" }),
                }),
                passportNo: z.string().trim().optional().default(""),
                phone: z.string().trim().optional().default(""),
            })
        )
        .min(1, "At least one member is required"),
});

// ── Step 4: Group Leader assigns pilgrims to rooms ──
export const assignMembersSchema = z.object({
    assignments: z
        .array(
            z.object({
                memberId: requiredString("Member ID").min(1),
                bookingId: requiredString("Booking ID").min(1),
            })
        )
        .min(1, "At least one assignment is required"),
});

// ── Step 5: Group Leader selects meals + add-ons ──
export const updateMealAddOnsSchema = z.object({
    mealSelection: z
        .object({
            planType: z
                .enum([
                    "breakfast_only",
                    "breakfast_lunch",
                    "breakfast_dinner",
                    "lunch_dinner",
                    "breakfast_lunch_dinner",
                    "custom",
                    "none",
                ])
                .optional(),
            servingMode: z.enum(["per_person", "per_room"]).optional(),
            preferences: z
                .object({
                    veg: z.number().int().min(0).optional().default(0),
                    nonVeg: z.number().int().min(0).optional().default(0),
                    allergies: z.string().trim().optional().default(""),
                    notes: z.string().trim().max(500).optional().default(""),
                })
                .optional()
                .default({}),
        })
        .optional(),
    addOnSelections: z
        .array(
            z.object({
                code: requiredString("Add-on code").min(1).max(50),
                quantity: z.number().int().min(1, "Quantity must be at least 1"),
                unitPrice: z.number().min(0, "Unit price cannot be negative"),
                pricingType: z.enum(["fixed", "usage_based"]).optional().default("fixed"),
            })
        )
        .optional()
        .default([]),
});

// ── Step 7: Cancel group ──
export const cancelGroupSchema = z.object({
    reason: z.string().max(255).optional(),
});

// ── Update group booking ──
export const updateGroupSchema = z.object({
    checkInDate: z.string().optional(),
    checkOutDate: z.string().optional(),
    groupName: z.string().min(2).max(100).optional(),
    totalPilgrims: z.number().int().min(2).optional(),
    preferences: z
        .object({
            preferredRoomType: z
                .enum(["single", "double", "triple", "shared", "dormitory", "group", "quad", ""])
                .optional(),
            genderPolicy: z
                .enum(["male_only", "female_only", "mixed", ""])
                .optional(),
            notes: z.string().max(500).optional(),
        })
        .optional(),
});

// ── List query ──
export const listGroupBookingsQuerySchema = z.object({
    branchId: z.string().optional(),
    status: z.enum(["pending", "confirmed", "completed", "cancelled"]).optional(),
    fromDate: z.string().optional(),
    toDate: z.string().optional(),
    page: z.coerce.number().int().min(1).optional().default(1),
    per_page: z.coerce.number().int().min(1).max(100).optional().default(10),
});

// ── Middleware factories (same pattern as booking) ──
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
