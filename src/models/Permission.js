import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema(
    {
        module: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Module",
            required: true,
        },
        action: {
            type: String,
            enum: ["create", "read", "update", "delete", "execute"],
            required: true,
        },
        description: {
            type: String,
            trim: true,
            default: "",
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

permissionSchema.index({ module: 1, action: 1 }, { unique: true });
permissionSchema.index({ isActive: 1 });

// Find all active permissions
permissionSchema.statics.findAllActive = function () {
    return this.find({ isActive: true })
    .populate("module", "_id name")
        .sort({ action: 1 });
};

// Find permissions by module
permissionSchema.statics.findByModule = function (moduleId) {
    return this.find({ module: moduleId, isActive: true })
    .populate("module", "_id name")
        .sort({ action: 1 });
};

// Find active permission by ID
permissionSchema.statics.findByIdActive = function (id) {
    return this.findOne({ _id: id, isActive: true }).populate("module", "_id name");
};

// Create permission
permissionSchema.statics.createPermission = async function (data) {
    const permission = new this({
        module: data.module,
        action: data.action.toLowerCase(),
        description: data.description || "",
    });
    return await permission.save();
};

// Update permission by ID
permissionSchema.statics.updatePermissionById = async function (id, updateData) {
    return await this.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
    ).populate("module", "_id name");
};

// Soft delete
permissionSchema.statics.softDeletePermission = async function (id) {
    return await this.findByIdAndUpdate(id, { isActive: false }, { new: true });
};

// Hard delete
permissionSchema.statics.hardDeletePermission = async function (id) {
    return await this.deleteOne({ _id: id });
};

// Toggle active status
permissionSchema.methods.toggleActive = async function () {
    this.isActive = !this.isActive;
    return await this.save();
};

const Permission = mongoose.model("Permission", permissionSchema);

export default Permission;
