import { sendForbidden, sendUnauthorized } from "../utils/apiResponse.js";
import Room from "../models/Room.js";
import { isAdminAuthUser } from "../utils/authUser.js";

// Check if room's branch matches user's branchId
export const checkRoomAccess = (paramName = "id") => {
    return async (req, res, next) => {
        if (!req.user) {
            return sendUnauthorized(res, "Authentication required");
        }

        if (isAdminAuthUser(req.user)) {
            return next(); // Admin bypasses all checks
        }

        const userBranchId = req.user.branchId;
        if (!userBranchId) {
            return sendForbidden(res, "Branch access denied");
        }

        const roomId = req.params?.[paramName];
        if (!roomId) {
            return sendForbidden(res, "Branch access denied");
        }

        const room = await Room.findById(roomId).select("branch").lean();
        if (!room) {
            return sendForbidden(res, "Branch access denied");
        }

        if (String(room.branch) !== String(userBranchId)) {
            return sendForbidden(res, "Branch access denied");
        }

        return next();
    };
};

// Check branchId in request body for room operations
export const checkRoomBodyAccess = (fieldName = "branchId") => {
    return (req, res, next) => {
        if (!req.user) {
            return sendUnauthorized(res, "Authentication required");
        }

        if (isAdminAuthUser(req.user)) {
            return next(); // Admin bypasses all checks
        }

        const userBranchId = req.user.branchId;
        if (!userBranchId) {
            return sendForbidden(res, "Branch access denied");
        }

        const bodyBranchId = req.validatedBody?.[fieldName] ?? req.body?.[fieldName];
        if (!bodyBranchId) {
            return next(); // Allow if not provided
        }

        if (String(bodyBranchId) !== String(userBranchId)) {
            return sendForbidden(res, "Branch access denied");
        }

        return next();
    };
};
