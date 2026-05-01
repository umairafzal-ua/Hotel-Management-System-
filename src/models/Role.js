import mongoose from "mongoose";
import { normalizeRoleSlug } from "../utils/rbacIdentifiers.js";

const roleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        slug: {
            type: String,
            unique: true,
            sparse: true,
            lowercase: true,
            trim: true,
        },
        label: {
            type: String,
            trim: true,
            default: "",
        },
        description: {
            type: String,
            trim: true,
            default: "",
        },
        permissions: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Permission",
        }],
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

roleSchema.index({ isActive: 1 });

roleSchema.pre("validate", function normalizeSlug(next) {
    if (this.slug) {
        this.slug = normalizeRoleSlug(this.slug);
    }
    next();
});

// Find all active roles with populated permissions
roleSchema.statics.findAllActive = function () {
    return this.find({ isActive: true })
        .populate({
            path: "permissions",
            populate: {
                path: "module",
                select: "_id code"
            }
        })
        .sort({ name: 1 });
};

// Find by ID and ensure it's active
roleSchema.statics.findByIdActive = function (id) {
    return this.findOne({ _id: id, isActive: true }).populate({
        path: "permissions",
        populate: {
            path: "module",
            select: "_id code"
        }
    });
};

// Find by name
roleSchema.statics.findByName = function (name) {
    // Escape regex special characters in the name
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return this.findOne({ name: new RegExp(`^${escapedName}$`, "i"), isActive: true }).populate({
        path: "permissions",
        populate: {
            path: "module",
            select: "_id code"
        }
    });
};

// Create a new role
roleSchema.statics.createRole = async function (data) {
    const role = new this({
        ...data,
        permissions: data.permissions || [],
    });
    return await role.save();
};

// Update role by ID
roleSchema.statics.updateRoleById = async function (id, updateData) {
    return await this.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
    ).populate({
        path: "permissions",
        populate: {
            path: "module",
            select: "_id code"
        }
    });
};

// Update role by name
roleSchema.statics.updateRoleByName = async function (name, updateData) {
    return await this.findOneAndUpdate(
        { name: name.toLowerCase() },
        { $set: updateData },
        { new: true, runValidators: true }
    ).populate({
        path: "permissions",
        populate: {
            path: "module",
            select: "_id code"
        }
    });
};

// Soft delete role
roleSchema.statics.softDeleteRole = async function (id) {
    return await this.findByIdAndUpdate(id, { isActive: false }, { new: true });
};

// Hard delete role
roleSchema.statics.hardDeleteRole = async function (id) {
    return await this.deleteOne({ _id: id });
};

// Add single permission to role
roleSchema.methods.addPermission = async function (permissionId) {
    if (!this.permissions.includes(permissionId)) {
        this.permissions.push(permissionId);
        return await this.save();
    }
    return this;
};

// Add multiple permissions to role (bulk)
roleSchema.methods.addPermissionsBulk = async function (permissionIds) {
    const newPermissions = permissionIds.filter(
        (pId) => !this.permissions.some(p => p.toString() === pId.toString())
    );
    this.permissions.push(...newPermissions);
    return await this.save();
};

// Remove single permission
roleSchema.methods.removePermission = async function (permissionId) {
    this.permissions = this.permissions.filter(
        (p) => p.toString() !== permissionId.toString()
    );
    return await this.save();
};

// Remove multiple permissions (bulk)
roleSchema.methods.removePermissionsBulk = async function (permissionIds) {
    const idsToRemove = permissionIds.map((id) => id.toString());
    this.permissions = this.permissions.filter(
        (p) => !idsToRemove.includes(p.toString())
    );
    return await this.save();
};

// Set permissions (replace all)
roleSchema.methods.setPermissions = async function (permissionIds) {
    this.permissions = permissionIds;
    return await this.save();
};

// Check if role has permission
roleSchema.methods.hasPermission = async function (permissionId) {
    return this.permissions.some(
        (p) => p.toString() === permissionId.toString()
    );
};

// Toggle active status
roleSchema.methods.toggleActive = async function () {
    this.isActive = !this.isActive;
    return await this.save();
};

const Role = mongoose.model("Role", roleSchema);

export default Role;
