import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true,
        },
        branch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Branch",
            required: true,
            index: true,
        },
        position: {
            type: String,
            trim: true,
            default: "",
        },
        department: {
            type: String,
            trim: true,
            default: "",
        },
        shift: {
            type: String,
            trim: true,
            default: "",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        loginAllowed: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

employeeSchema.index({ isActive: 1 });
employeeSchema.index({ branch: 1, isActive: 1 });

employeeSchema.statics.findActiveByUserId = function (userId) {
    return this.findOne({ user: userId, isActive: true }).select("branch").lean();
};

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;
