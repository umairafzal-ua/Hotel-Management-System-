import mongoose from "mongoose";

const groupBookingSchema = new mongoose.Schema(
    {
        branch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Branch",
            required: [true, "Branch is required"],
            index: true,
        },
        groupLeader: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Group leader is required"],
            index: true,
        },
        groupName: {
            type: String,
            required: [true, "Group name is required"],
            trim: true,
            minlength: [2, "Group name must be at least 2 characters"],
            maxlength: [100, "Group name must not exceed 100 characters"],
        },
        totalPilgrims: {
            type: Number,
            required: [true, "Total pilgrims is required"],
            min: [2, "Total pilgrims must be at least 2"],
        },
        checkInDate: {
            type: Date,
            required: [true, "Check-in date is required"],
        },
        checkOutDate: {
            type: Date,
            required: [true, "Check-out date is required"],
        },
        preferences: {
            preferredRoomType: {
                type: String,
                enum: {
                    values: ["single", "double", "triple", "shared", "dormitory", "group", "quad", ""],
                    message: "Preferred room type is invalid",
                },
                default: "",
            },
            genderPolicy: {
                type: String,
                enum: {
                    values: ["male_only", "female_only", "mixed", ""],
                    message: "Gender policy must be one of: male_only, female_only, mixed",
                },
                default: "",
            },
            notes: {
                type: String,
                trim: true,
                maxlength: 500,
                default: "",
            },
        },
        status: {
            type: String,
            enum: {
                values: ["pending", "confirmed", "completed", "cancelled"],
                message: "Status must be one of: pending, confirmed, completed, cancelled",
            },
            default: "pending",
            index: true,
        },
        mealSelection: {
            planType: {
                type: String,
                enum: {
                    values: ["breakfast_only", "breakfast_lunch", "breakfast_dinner", "lunch_dinner", "breakfast_lunch_dinner", "custom", "none", ""],
                    message: "Meal plan type is invalid",
                },
                default: "",
            },
            servingMode: {
                type: String,
                enum: {
                    values: ["per_person", "per_room", ""],
                    message: "Serving mode must be per_person or per_room",
                },
                default: "",
            },
            preferences: {
                veg: { type: Number, default: 0, min: 0 },
                nonVeg: { type: Number, default: 0, min: 0 },
                allergies: { type: String, trim: true, default: "" },
                notes: { type: String, trim: true, maxlength: 500, default: "" },
            },
        },
        addOnSelections: [
            {
                code: {
                    type: String,
                    required: true,
                    trim: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: [1, "Quantity must be at least 1"],
                },
                unitPrice: {
                    type: Number,
                    required: true,
                    min: [0, "Unit price cannot be negative"],
                },
                pricingType: {
                    type: String,
                    enum: ["fixed", "usage_based"],
                    default: "fixed",
                },
            },
        ],
        allocatedBookings: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Booking",
            },
        ],
        invoiceSnapshot: {
            lineItems: [
                {
                    type: { type: String },
                    description: { type: String },
                    amount: { type: Number },
                },
            ],
            total: { type: Number, default: 0 },
            generatedAt: { type: Date },
        },
        cancelledAt: {
            type: Date,
            default: null,
        },
        cancellationReason: {
            type: String,
            trim: true,
            maxlength: 255,
            default: null,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Created by is required"],
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

// Compound indexes
groupBookingSchema.index({ branch: 1, status: 1 });
groupBookingSchema.index({ groupLeader: 1, status: 1 });
groupBookingSchema.index({ branch: 1, checkInDate: 1 });

// Date validation
groupBookingSchema.pre("validate", function () {
    if (!this.checkInDate || !this.checkOutDate) return;
    if (new Date(this.checkOutDate) <= new Date(this.checkInDate)) {
        throw new Error("Check-out date must be after check-in date");
    }
});

const GroupBooking = mongoose.model("GroupBooking", groupBookingSchema);
export default GroupBooking;
