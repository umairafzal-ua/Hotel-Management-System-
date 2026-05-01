import * as roleRepository from "../../repositories/RoleRepository.js";
import * as permissionRepository from "../../repositories/PermissionRepository.js";

class UpdateRoleService {
    async execute(id, updateData) {
        try {
            const role = await roleRepository.getRoleById(id);
            if (!role) {
                throw new Error("Role not found");
            }

            // Build clean update object with only defined fields
            const cleanUpdate = {};
            if (updateData.name !== undefined) cleanUpdate.name = updateData.name;
            if (updateData.slug !== undefined) cleanUpdate.slug = updateData.slug;
            if (updateData.label !== undefined) cleanUpdate.label = updateData.label;
            if (updateData.description !== undefined) cleanUpdate.description = updateData.description;
            if (updateData.isActive !== undefined) cleanUpdate.isActive = updateData.isActive;

            if (updateData.slug !== undefined) {
                const taken = await roleRepository.getRoleBySlug(updateData.slug);
                if (taken && String(taken._id) !== String(id)) {
                    throw new Error("Role slug already exists");
                }
            }

            // Handle permissions - if provided (even empty array), validate and include
            if (updateData.permissions !== undefined) {
                // Validate all permission IDs exist
                if (Array.isArray(updateData.permissions) && updateData.permissions.length > 0) {
                    for (const permissionId of updateData.permissions) {
                        const permission = await permissionRepository.getPermissionById(permissionId);
                        if (!permission) {
                            throw new Error(`Permission ${permissionId} not found`);
                        }
                    }
                }
                // Set permissions (can be empty array to clear all)
                cleanUpdate.permissions = updateData.permissions || [];
            }

            if (Object.keys(cleanUpdate).length === 0) {
                throw new Error("No valid update fields provided");
            }

            return await roleRepository.updateRole(id, cleanUpdate);
        } catch (error) {
            throw error;
        }
    }
}

export default new UpdateRoleService();
