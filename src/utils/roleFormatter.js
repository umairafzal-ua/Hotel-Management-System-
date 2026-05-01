// Convert module name to snake_case (fallback when code missing)
const toSnakeCase = (str) => {
    return str
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
};

// Format role response with simplified permissions structure (keys = module code, lowercased)
export const formatRoleResponse = (role) => {
    if (!role) return null;

    const roleObj = role.toObject ? role.toObject() : role;
    const permissionsByModule = {};

    if (roleObj.permissions && Array.isArray(roleObj.permissions)) {
        roleObj.permissions.forEach((p) => {
            const action = p.action;
            const mod = p.module;
            const key = mod?.code
                ? String(mod.code).toLowerCase()
                : mod?.name
                  ? toSnakeCase(mod.name)
                  : null;
            if (key && action) {
                if (!permissionsByModule[key]) {
                    permissionsByModule[key] = [];
                }
                if (!permissionsByModule[key].includes(action)) {
                    permissionsByModule[key].push(action);
                }
            }
        });
    }

    return {
        id: roleObj._id,
        name: roleObj.name,
        slug: roleObj.slug ?? null,
        label: roleObj.label ?? "",
        permissions: permissionsByModule,
        createdAt: roleObj.createdAt,
        updatedAt: roleObj.updatedAt,
    };
};
