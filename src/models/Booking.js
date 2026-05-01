import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
    {
        branch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Branch",
            required: [true, "Branch is required"],
            index: true,
        },
        room: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room",
            required: [true, "Room is required"],
            index: true,
        },
        customer: {
            name: {
                type: String,
                required: [true, "Customer name is required"],
                trim: true,
            },
            email: {
                type: String,
                trim: true,
                lowercase: true,
            },
            phone: {
                type: String,
                trim: true,
            },
        },
        partyType: {
            type: String,
            enum: {
                values: ["individual", "couple", "group"],
                message: "Party type must be one of: individual, couple, group",
            },
            required: [true, "Party type is required"],
        },
        guestCount: {
            type: Number,
            required: [true, "Guest count is required"],
            min: [1, "Guest count must be at least 1"],
        },
        gender: {
            type: String,
            enum: {
                values: ["male", "female", "mixed"],
                message: "Gender must be one of: male, female, mixed",
            },
            default: "mixed",
        },
        checkInDate: {
            type: Date,
            required: [true, "Check-in date is required"],
        },
        checkOutDate: {
            type: Date,
            required: [true, "Check-out date is required"],
        },
        allocatedSlots: {
            type: Number,
            required: [true, "Allocated slots are required"],
            min: [1, "Allocated slots must be at least 1"],
        },
        status: {
            type: String,
            enum: {
                values: ["confirmed", "cancelled", "reassigned", "completed"],
                message: "Status must be one of: confirmed, cancelled, reassigned, completed",
            },
            default: "confirmed",
            index: true,
        },
        completedAt: {
            type: Date,
        },
        previousRoom: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room",
        },
        reassignedAt: {
            type: Date,
        },
        cancelledAt: {
            type: Date,
        },
        cancellationReason: {
            type: String,
            trim: true,
            maxlength: 255,
        },
        notes: {
            type: String,
            trim: true,
            maxlength: 500,
        },
        bookingScope: {
            type: String,
            enum: {
                values: ["single", "group_child"],
                message: "Booking scope must be single or group_child",
            },
            default: "single",
        },
        groupBooking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "GroupBooking",
            default: null,
            index: true,
            sparse: true,
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

bookingSchema.index({ room: 1, status: 1, checkInDate: 1, checkOutDate: 1 });
bookingSchema.index({ branch: 1, status: 1, checkInDate: 1 });

bookingSchema.pre("validate", function () {
    if (!this.checkInDate || !this.checkOutDate) {
        return;
    }

    if (new Date(this.checkOutDate) <= new Date(this.checkInDate)) {
        throw new Error("Check-out date must be after check-in date");
    }
});

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
