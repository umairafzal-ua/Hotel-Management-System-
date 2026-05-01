import { sendError } from "../utils/apiResponse.js";
import { getRoleById } from "../repositories/RoleRepository.js";
import Role from "../models/Role.js";
import { isAdminAuthUser, isAdminRoleSlug } from "../utils/authUser.js";

const parseModuleAction = (requiredPermissionCode) => {
    const idx = requiredPermissionCode.indexOf(":");
    if (idx === -1) {
        return { moduleSegment: "", action: "" };
    }
    return {
        moduleSegment: requiredPermissionCode.slice(0, idx).trim(),
        action: requiredPermissionCode.slice(idx + 1).trim(),
    };
};

const moduleKeyMatches = (moduleRef, moduleSegmentUpper) => {
    if (!moduleRef || typeof moduleRef !== "object" || !moduleRef.code) return false;
    return String(moduleRef.code).toUpperCase() === moduleSegmentUpper;
};

const formatPermissionCode = (p) => {
    const mod =
        typeof p.module === "object" && p.module?.code
            ? p.module.code
            : "UNKNOWN";
    return `${mod}:${p.action}`;
};

const isAdminUser = (reqUser, roleDoc) =>
    isAdminAuthUser(reqUser) || isAdminRoleSlug(roleDoc?.slug);

const resolveRoleFromRequestUser = async (reqUser) => {
    if (!reqUser?.roleId) return null;
    return await getRoleById(reqUser.roleId);
};

/**
 * Middleware to check if user has a specific permission
 * @param {string} requiredPermissionCode - Permission code to check (e.g., "USERS:read")
 */
export const checkPermission = (requiredPermissionCode) => {
    return async (req, res, next) => {
        try {
            if (process.env.NODE_ENV === "development") {
                console.log("[Permission Check] Required Permission:", requiredPermissionCode);
                console.log("[Permission Check] User:", req.user);
            }

            if (!req.user?.roleId) {
                return sendError(res, 403, "User role not found");
            }

            // BYPASS: Admin role from token has full access to everything
            if (isAdminUser(req.user, null)) {
                if (process.env.NODE_ENV === "development") {
                    console.log("[Permission Check] Admin role from token - bypassing permission check");
                }
                req.permissions = ["*"];
                return next();
            }

            const role = await resolveRoleFromRequestUser(req.user);
            if (!role) {
                if (process.env.NODE_ENV === "development") {
                    console.log("[Permission Check] Role not found for:", req.user.roleId);
                }
                return sendError(res, 403, "User role is invalid");
            }

            // BYPASS: Admin role has full access to everything
            if (isAdminUser(req.user, role)) {
                if (process.env.NODE_ENV === "development") {
                    console.log("[Permission Check] Admin role - bypassing permission check");
                }
                req.permissions = ["*"]; // Indicate super admin
                return next();
            }

            if (process.env.NODE_ENV === "development") {
                console.log("[Permission Check] Role Found:", role.name, "ID:", role._id);
                console.log("[Permission Check] Role permissions count:", role.permissions?.length);
            }

            // Populate permissions with their module refs
            const populatedRole = await Role.findById(role._id).populate({
                path: "permissions",
                populate: { path: "module", select: "_id code" }
            });

            if (process.env.NODE_ENV === "development") {
                console.log("[Permission Check] Populated permissions:", populatedRole?.permissions?.length);
            }

            if (!populatedRole || !populatedRole.permissions || populatedRole.permissions.length === 0) {
                if (process.env.NODE_ENV === "development") {
                    console.log("[Permission Check] No permissions found for role");
                }
                return sendError(res, 403, `Permission denied. Required: ${requiredPermissionCode}`);
            }

            // Filter only active permissions
            const activePermissions = populatedRole.permissions.filter(p => p.isActive);

            // Check permission using module:action format (e.g., "ROLES:read")
            const { moduleSegment, action } = parseModuleAction(requiredPermissionCode);
            const moduleSegUpper = moduleSegment.toUpperCase();
            const hasPermission = activePermissions.some((permission) => {
                if (!permission.module || !permission.action) return false;
                const modRef = typeof permission.module === "object" ? permission.module : null;
                if (!modRef) return false;
                return (
                    moduleKeyMatches(modRef, moduleSegUpper) &&
                    permission.action.toLowerCase() === action.toLowerCase()
                );
            });

            if (process.env.NODE_ENV === "development") {
                console.log("[Permission Check] Has Permission:", hasPermission);
            }

            if (!hasPermission) {
                return sendError(
                    res,
                    403,
                    `Permission denied. Required: ${requiredPermissionCode}`
                );
            }

            req.permissions = activePermissions.map((p) => formatPermissionCode(p).toUpperCase());
            next();
        } catch (error) {
            if (process.env.NODE_ENV === "development") {
                console.error("[Permission Check] Error:", error);
            }
            return sendError(res, 500, "Error checking permissions");
        }
    };
};

/**
 * Middleware to check if user has ANY of the specified permissions
 * @param {array} requiredPermissions - Array of permission codes
 */
export const checkAnyPermission = (requiredPermissions) => {
    return async (req, res, next) => {
        try {
            if (!req.user?.roleId) {
                return sendError(res, 403, "User role not found");
            }

            const role = await resolveRoleFromRequestUser(req.user);
            if (!role) {
                return sendError(res, 403, "User role is invalid");
            }

            // BYPASS: Admin role has full access to everything
            if (isAdminUser(req.user, role)) {
                if (process.env.NODE_ENV === "development") {
                    console.log("[Permission Check] Admin role - bypassing ANY permission check");
                }
                req.permissions = ["*"];
                return next();
            }

            const populatedRole = await Role.findById(role._id).populate({
                path: "permissions",
                populate: { path: "module", select: "_id code" },
            });

            if (!populatedRole || !populatedRole.permissions) {
                return sendError(res, 403, "User role is invalid");
            }

            const userPermissions = populatedRole.permissions
                .filter((p) => p && p.isActive)
                .map((p) => formatPermissionCode(p).toUpperCase());
            
            const hasAnyPermission = requiredPermissions.some((perm) =>
                userPermissions.includes(perm.toUpperCase())
            );

            if (!hasAnyPermission) {
                return sendError(
                    res,
                    403,
                    `Permission denied. Required any of: ${requiredPermissions.join(", ")}`
                );
            }

            req.permissions = userPermissions;
            next();
        } catch (error) {
            return sendError(res, 500, "Error checking permissions");
        }
    };
};

/**
 * Middleware to check if user has ALL specified permissions
 * @param {array} requiredPermissions - Array of permission codes
 */
export const checkAllPermissions = (requiredPermissions) => {
    return async (req, res, next) => {
        try {
            if (!req.user?.roleId) {
                return sendError(res, 403, "User role not found");
            }

            const role = await resolveRoleFromRequestUser(req.user);
            if (!role) {
                return sendError(res, 403, "User role is invalid");
            }

            // BYPASS: Admin role has full access to everything
            if (isAdminUser(req.user, role)) {
                if (process.env.NODE_ENV === "development") {
                    console.log("[Permission Check] Admin role - bypassing ALL permissions check");
                }
                req.permissions = ["*"];
                return next();
            }

            const populatedRole = await Role.findById(role._id).populate({
                path: "permissions",
                populate: { path: "module", select: "_id code" },
            });

            if (!populatedRole || !populatedRole.permissions) {
                return sendError(res, 403, "User role is invalid");
            }

            const userPermissions = populatedRole.permissions
                .filter((p) => p && p.isActive)
                .map((p) => formatPermissionCode(p).toUpperCase());
            
            const hasAllPermissions = requiredPermissions.every((perm) =>
                userPermissions.includes(perm.toUpperCase())
            );

            if (!hasAllPermissions) {
                return sendError(
                    res,
                    403,
                    `Permission denied. Required all of: ${requiredPermissions.join(", ")}`
                );
            }

            req.permissions = userPermissions;
            next();
        } catch (error) {
            return sendError(res, 500, "Error checking permissions");
        }
    };
};

/**
 * Middleware to attach user permissions to request
 * Can be used on all authenticated routes to have permissions available
 */
export const attachPermissions = async (req, res, next) => {
    try {
        if (!req.user?.roleId) {
            req.permissions = [];
            return next();
        }

        const role = await resolveRoleFromRequestUser(req.user);
        if (!role) {
            req.permissions = [];
            return next();
        }

        // BYPASS: Admin role has full access to everything
        if (isAdminUser(req.user, role)) {
            if (process.env.NODE_ENV === "development") {
                console.log("[attachPermissions] Admin role - granting all permissions");
            }
            req.permissions = ["*"];
            return next();
        }

        const populatedRole = await Role.findById(role._id).populate({
            path: "permissions",
            populate: { path: "module", select: "_id code" },
        });

        if (!populatedRole || !populatedRole.permissions) {
            req.permissions = [];
            return next();
        }

        req.permissions = populatedRole.permissions
            .filter((p) => p && p.isActive)
            .map((p) => formatPermissionCode(p).toUpperCase());
        req.userRole = role;
        next();
    } catch (error) {
        req.permissions = [];
        next();
    }
};
