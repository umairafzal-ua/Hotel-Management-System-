import mongoose from "mongoose";
import { normalizeModuleCode } from "../utils/rbacIdentifiers.js";

const moduleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        code: {
            type: String,
            unique: true,
            sparse: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            default: "",
        },
        icon: {
            type: String,
            default: null,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

moduleSchema.index({ isActive: 1 });

moduleSchema.pre("validate", function normalizeCode() {
    if (this.code) {
        this.code = normalizeModuleCode(this.code);
    }
});

// Find all active modules
moduleSchema.statics.findAllActive = function () {
    return this.find({ isActive: true }).sort({ name: 1 });
};

// Find by ID and ensure it's active
moduleSchema.statics.findByIdActive = function (id) {
    return this.findOne({ _id: id, isActive: true });
};

// Create a new module
moduleSchema.statics.createModule = async function (data) {
    const module = new this(data);
    return await module.save();
};

// Update module by ID
moduleSchema.statics.updateModuleById = async function (id, updateData) {
    return await this.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
    );
};

// Soft delete (deactivate)
moduleSchema.statics.softDeleteModule = async function (id) {
    return await this.findByIdAndUpdate(id, { isActive: false }, { new: true });
};

// Hard delete
moduleSchema.statics.hardDeleteModule = async function (id) {
    return await this.deleteOne({ _id: id });
};

// Toggle active status
moduleSchema.methods.toggleActive = async function () {
    this.isActive = !this.isActive;
    return await this.save();
};

const Module = mongoose.model("Module", moduleSchema);

export default Module;
