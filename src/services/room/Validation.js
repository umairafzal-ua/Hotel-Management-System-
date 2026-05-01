import { z } from "zod";

// Reusable schema building blocks
const requiredString = (field) =>
    z.string({
        required_error: `${field} is required`,
        invalid_type_error: `${field} must be a string`,
    });

const requiredNumber = (field, minValue = 0) =>
    z.number({
        required_error: `${field} is required`,
        invalid_type_error: `${field} must be a number`,
    }).min(minValue, `${field} must be at least ${minValue}`);

// Room type validation
const roomTypeEnum = z.enum(["single", "double", "triple", "shared", "dormitory", "group", "quad"], {
    errorMap: () => ({ message: "Type must be one of: single, double, triple, shared, dormitory, group, quad" }),
});

const roomStatusEnum = z.enum(["available", "occupied", "maintenance", "cleaning"], {
    errorMap: () => ({ message: "Status must be one of: available, occupied, maintenance, cleaning" }),
});

const genderRestrictionEnum = z.enum(["unrestricted", "male_only", "female_only", "couples_only"], {
    errorMap: () => ({ message: "Gender restriction must be one of: unrestricted, male_only, female_only, couples_only" }),
});

const sharedOccupancyPolicyEnum = z.enum(["mixed", "individuals_only", "couples_only"], {
    errorMap: () => ({ message: "Shared occupancy policy must be one of: mixed, individuals_only, couples_only" }),
});

// Main schemas
export const createRoomSchema = z.object({
    roomNumber: requiredString("Room number").min(1).max(50),
    type: roomTypeEnum,
    branchId: requiredString("Branch ID").min(1),
    floor: requiredNumber("Floor number", 0),
    capacity: requiredNumber("Capacity", 1),
    basePrice: requiredNumber("Base price", 0),
    amenities: z.array(z.string()).optional().default([]),
    status: roomStatusEnum.optional().default("available"),
    genderRestriction: genderRestrictionEnum.optional().default("unrestricted"),
    sharedOccupancyPolicy: sharedOccupancyPolicyEnum.optional().default("mixed"),
    isActive: z.boolean().optional().default(true),
});

export const bulkCreateRoomsSchema = z.object({
    rooms: z.array(
        z.object({
            roomNumber: requiredString("Room number").min(1).max(50),
            type: roomTypeEnum,
            branchId: requiredString("Branch ID").min(1),
            floor: requiredNumber("Floor number", 0),
            capacity: requiredNumber("Capacity", 1),
            basePrice: requiredNumber("Base price", 0),
            amenities: z.array(z.string()).optional().default([]),
            status: roomStatusEnum.optional().default("available"),
            genderRestriction: genderRestrictionEnum.optional().default("unrestricted"),
            sharedOccupancyPolicy: sharedOccupancyPolicyEnum.optional().default("mixed"),
            isActive: z.boolean().optional().default(true),
        })
    ),
    minItems: 1,
    errorMap: () => ({ message: "At least one room must be provided" }),
});

export const updateRoomSchema = z
    .object({
        roomNumber: z.string().trim().min(1).max(50).optional(),
        type: roomTypeEnum.optional(),
        floor: z.number().optional(),
        capacity: z.number().optional(),
        basePrice: z.number().optional(),
        amenities: z.array(z.string()).optional(),
        status: roomStatusEnum.optional(),
        genderRestriction: genderRestrictionEnum.optional(),
        sharedOccupancyPolicy: sharedOccupancyPolicyEnum.optional(),
        isActive: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field must be provided for update",
    });

export const checkAvailabilitySchema = z.object({
    branchId: requiredString("Branch ID").min(1),
    roomType: roomTypeEnum,
    capacity: z.number().min(1).optional(),
    page: z.number().optional().default(1),
    per_page: z.number().optional().default(10),
});

export const updateStatusSchema = z.object({
    status: roomStatusEnum,
});

export const getRoomsListSchema = z.object({
    branchId: z.string().trim().optional(),
    type: roomTypeEnum.optional(),
    floor: z.number().optional(),
    status: roomStatusEnum.optional(),
    page: z.number().optional().default(1),
    per_page: z.number().optional().default(10),
});

// Validation middleware
export const validate = (schema) => (req, res, next) => {
    try {
        const validatedData = schema.parse(req.body);
        req.validatedBody = validatedData; // Store validated data
        if (process.env.NODE_ENV === "development") {
            console.log("[Validation] Success for Room:", Object.keys(validatedData).join(", "));
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

/**
 * Validation middleware for multipart/form-data requests.
 * Coerces string values from form fields into proper types before
 * running the Zod schema validation.
 */
export const validateMultipart = (schema) => (req, res, next) => {
    try {
        const body = { ...req.body };

        // Coerce numeric fields
        const numericFields = ["floor", "capacity", "basePrice"];
        for (const field of numericFields) {
            if (body[field] !== undefined) {
                body[field] = Number(body[field]);
            }
        }

        // Coerce boolean fields
        if (body.isActive !== undefined) {
            body.isActive = body.isActive === "true" || body.isActive === true;
        }

        // Coerce array fields (sent as JSON string or comma-separated)
        if (body.amenities !== undefined && typeof body.amenities === "string") {
            try {
                body.amenities = JSON.parse(body.amenities);
            } catch {
                body.amenities = body.amenities.split(",").map((s) => s.trim()).filter(Boolean);
            }
        }

        const validatedData = schema.parse(body);
        req.validatedBody = validatedData;
        if (process.env.NODE_ENV === "development") {
            console.log("[Validation Multipart] Success for Room:", Object.keys(validatedData).join(", "));
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

// Query validation middleware
export const validateQuery = (schema) => (req, res, next) => {
    try {
        const validatedQuery = schema.parse(req.query);
        req.validatedQuery = validatedQuery;
        if (process.env.NODE_ENV === "development") {
            console.log("[Query Validation] Success for Room:", Object.keys(validatedQuery).join(", "));
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
                message: "Query validation failed",
                errors,
                data: null,
            });
        }
        next(error);
    }
};

