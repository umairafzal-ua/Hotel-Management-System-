/** Admin bypass from normalized JWT claims (roleSlug). */
export const isAdminRoleSlug = (roleSlug) =>
    typeof roleSlug === "string" && roleSlug.toLowerCase() === "admin";

export const isAdminAuthUser = (reqUser) => isAdminRoleSlug(reqUser?.roleSlug);
