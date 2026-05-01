import { sendForbidden, sendUnauthorized } from "../utils/apiResponse.js";
import Employee from "../models/Employee.js";
import { isAdminAuthUser } from "../utils/authUser.js";


export const checkBranchAccess = (paramName = "branchId") => {
    return (req, res, next) => {
        if (!req.user) {
            return sendUnauthorized(res, "Authentication required");
        }

        if (isAdminAuthUser(req.user)) {
            return next();
        }

        const userBranchId = req.user.branchId;
        if (!userBranchId) {
            return sendForbidden(res, "Branch access denied");
        }

        const targetId = req.params?.[paramName];
        if (!targetId) {
            return sendForbidden(res, "Branch access denied");
        }

        if (String(userBranchId) !== String(targetId)) {
            return sendForbidden(res, "Branch access denied");
        }

        return next();
    };
};

/**
 * Enforces branch isolation based on an Employee resource ID.
 * Non-admin users can only access employees within their own branch.
 */
export const checkEmployeeAccess = (paramName = "id") => {
    return async (req, res, next) => {
        if (!req.user) {
            return sendUnauthorized(res, "Authentication required");
        }

        if (isAdminAuthUser(req.user)) {
            return next();
        }

        const userBranchId = req.user.branchId;
        if (!userBranchId) {
            return sendForbidden(res, "Branch access denied");
        }

        const employeeId = req.params?.[paramName];
        if (!employeeId) {
            return sendForbidden(res, "Branch access denied");
        }

        const employee = await Employee.findById(employeeId).select("branch").lean();
        if (!employee) {
            return sendForbidden(res, "Branch access denied");
        }

        if (String(employee.branch) !== String(userBranchId)) {
            return sendForbidden(res, "Branch access denied");
        }

        return next();
    };
};

/**
 * For non-admin users, prevents using a different branchId in request body.
 * Use this on endpoints that accept `branchId` in body (assign/update).
 */
export const checkBranchBodyAccess = (fieldName = "branchId") => {
    return (req, res, next) => {
        if (!req.user) {
            return sendUnauthorized(res, "Authentication required");
        }

        if (isAdminAuthUser(req.user)) {
            return next();
        }

        const userBranchId = req.user.branchId;
        if (!userBranchId) {
            return sendForbidden(res, "Branch access denied");
        }

        const bodyBranchId = req.validatedBody?.[fieldName] ?? req.body?.[fieldName];
        if (!bodyBranchId) {
            return next();
        }

        if (String(bodyBranchId) !== String(userBranchId)) {
            return sendForbidden(res, "Branch access denied");
        }

        return next();
    };
};

export default { checkBranchAccess, checkEmployeeAccess, checkBranchBodyAccess };
