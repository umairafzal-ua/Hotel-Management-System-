/** Lowercase alphanumeric slug for roles (e.g. "Group Leader" → "groupleader"). */
export function deriveRoleSlug(name) {
    if (!name || typeof name !== "string") return "";
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function normalizeRoleSlug(slug) {
    return deriveRoleSlug(slug);
}

/** Uppercase module code with underscores (display names may map via migration). */
export function deriveModuleCode(name) {
    if (!name || typeof name !== "string") return "";
    return name
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .replace(/_+/g, "_");
}

export function normalizeModuleCode(code) {
    if (!code || typeof code !== "string") return "";
    return code
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .replace(/_+/g, "_");
}
