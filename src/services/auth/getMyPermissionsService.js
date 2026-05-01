import { getRoleById } from "../../repositories/RoleRepository.js";
import Role from "../../models/Role.js";
import { deriveRoleSlug } from "../../utils/rbacIdentifiers.js";
import { isAdminAuthUser, isAdminRoleSlug } from "../../utils/authUser.js";

const resolveRoleForUser = async (reqUser) => {
    if (!reqUser?.roleId) return null;
    return await getRoleById(reqUser.roleId);
};

class GetMyPermissionsService {
    async execute(reqUser) {
        const role = await resolveRoleForUser(reqUser);
        if (!role) {
            return {
                role: null,
                permissions: [],
                modules: [],
            };
        }

        const slug = role.slug || deriveRoleSlug(role.name);
        const label = role.label || role.name || "";

        const isAdmin =
            isAdminAuthUser(reqUser) || isAdminRoleSlug(slug);

        if (isAdmin) {
            return {
                role: { id: role._id, slug: "admin", label: label || "Admin" },
                permissions: ["*"],
                modules: ["*"],
            };
        }

        const populatedRole = await Role.findById(role._id).populate({
            path: "permissions",
            populate: { path: "module", select: "_id code" },
        });

        const active = populatedRole?.permissions?.filter((p) => p?.isActive) || [];

        const permissions = active.map((p) => {
            const mod =
                typeof p.module === "object" && p.module?.code
                    ? String(p.module.code)
                    : "UNKNOWN";
            return `${mod.toUpperCase()}:${String(p.action).toUpperCase()}`;
        });

        const modules = [
            ...new Set(
                active
                    .map((p) => {
                        if (typeof p.module !== "object" || !p.module?.code) return null;
                        return String(p.module.code).toUpperCase();
                    })
                    .filter(Boolean)
            ),
        ];

        return {
            role: { id: role._id, slug, label },
            permissions,
            modules,
        };
    }
}

export default new GetMyPermissionsService();
