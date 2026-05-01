import * as roleRepository from "../../repositories/RoleRepository.js";
import * as permissionRepository from "../../repositories/PermissionRepository.js";
import { deriveRoleSlug, normalizeRoleSlug } from "../../utils/rbacIdentifiers.js";

class CreateRoleService {
    async execute(roleData) {
        try {
            // Check if role name already exists
            const existingRole = await roleRepository.getRoleByName(roleData.name);
            if (existingRole) {
                throw new Error("Role name already exists");
            }

            const slug = normalizeRoleSlug(roleData.slug || deriveRoleSlug(roleData.name));
            if (!slug) {
                throw new Error("Role slug could not be derived from name");
            }
            const slugTaken = await roleRepository.getRoleBySlug(slug);
            if (slugTaken) {
                throw new Error("Role slug already exists");
            }

            // Verify all permissions exist if provided
            if (roleData.permissions && roleData.permissions.length > 0) {
                for (const permissionId of roleData.permissions) {
                    const permission = await permissionRepository.getPermissionById(permissionId);
                    if (!permission) {
                        throw new Error(`Permission ${permissionId} not found`);
                    }
                }
            }

            const role = await roleRepository.createRole({
                name: roleData.name,
                slug,
                label: roleData.label?.trim() ?? "",
                description: roleData.description,
                permissions: roleData.permissions || [],
            });

            await role.populate({
                path: "permissions",
                populate: { path: "module", select: "_id code" }
            });
            return role;
        } catch (error) {
            throw error;
        }
    }
}

export default new CreateRoleService();
