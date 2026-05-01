import { deriveRoleSlug } from "./rbacIdentifiers.js";

/**
 * Access token payload: roleId + roleSlug only (no legacy display-name claim).
 */
export function buildAccessTokenPayload(user, branchId = null) {
    const roleDoc =
        user?.role && typeof user.role === "object" && user.role._id ? user.role : null;
    const roleName = roleDoc?.name || null;
    const roleId = roleDoc?._id ? String(roleDoc._id) : null;
    const roleSlug =
        (roleDoc?.slug && String(roleDoc.slug)) ||
        (roleName ? deriveRoleSlug(roleName) : null);

    if (!roleId || !roleSlug) {
        throw new Error("Cannot mint access token: user role must have id and slug");
    }

    return {
        userId: user._id,
        email: user.email,
        roleId,
        roleSlug,
        branchId: branchId ?? null,
        type: "access",
    };
}
