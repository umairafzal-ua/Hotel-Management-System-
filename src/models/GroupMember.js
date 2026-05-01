import mongoose from "mongoose";

const groupMemberSchema = new mongoose.Schema(
    {
        groupBooking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "GroupBooking",
            required: [true, "Group booking is required"],
            index: true,
        },
        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true,
            minlength: [2, "Name must be at least 2 characters"],
            maxlength: [100, "Name must not exceed 100 characters"],
        },
        gender: {
            type: String,
            enum: {
                values: ["male", "female"],
                message: "Gender must be male or female",
            },
            required: [true, "Gender is required"],
        },
        passportNo: {
            type: String,
            trim: true,
            default: "",
        },
        phone: {
            type: String,
            trim: true,
            default: "",
        },
        assignedBooking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
            default: null,
        },
        assignedRoom: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room",
            default: null,
        },
        assignmentStatus: {
            type: String,
            enum: {
                values: ["unassigned", "assigned"],
                message: "Assignment status must be unassigned or assigned",
            },
            default: "unassigned",
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for common queries
groupMemberSchema.index({ groupBooking: 1, assignmentStatus: 1 });

const GroupMember = mongoose.model("GroupMember", groupMemberSchema);
export default GroupMember;
