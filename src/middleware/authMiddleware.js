import jwt from "jsonwebtoken";
import { userRepository } from "../repositories/UserRepository.js";
import { ApiError, sendForbidden, sendUnauthorized } from "../utils/apiResponse.js";

const buildReqUserFromDecoded = (decoded) => {
    if (!decoded?.roleId || !decoded?.roleSlug) {
        return null;
    }
    return {
        userId: decoded.userId,
        email: decoded.email,
        roleId: decoded.roleId,
        roleSlug: decoded.roleSlug,
        branchId: decoded.branchId ?? null,
    };
};

export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return sendUnauthorized(res, "Access token is required");
        }
        const token = authHeader.split(" ")[1];

        if (!token) {
            return sendUnauthorized(res, "Access token is required");
        }
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || "your-access-secret-key");
        if (process.env.NODE_ENV === "development") {
            console.log("[Auth Middleware] Decoded Token:", decoded);
        }
        // Check if user still exists and is active (optimized lightweight query)
        const user = await userRepository.findByIdForAuth(decoded.userId);
        if (!user) {
            return sendUnauthorized(res, "User no longer exists");
        }
        if (!user.isActive) {
            return sendForbidden(res, "Account is deactivated");
        }
        // Check if password was changed after token was issued
        if (user.passwordChangedAt) {
            const changedTimestamp = parseInt(user.passwordChangedAt.getTime() / 1000, 10);
            if (decoded.iat < changedTimestamp) {
                return sendUnauthorized(res, "Password was recently changed. Please login again.");
            }
        }

        const authUser = buildReqUserFromDecoded(decoded);
        if (!authUser) {
            return sendUnauthorized(res, "Invalid token: sign in again to refresh your session.");
        }
        req.user = authUser;
        if (process.env.NODE_ENV === "development") {
            console.log("[Auth Middleware] User set in req.user:", req.user);
        }
        next();
    } catch (error) {
        if (process.env.NODE_ENV === "development") {
            console.error("[Auth Middleware] Error:", error.name, error.message);
        }
        if (error instanceof ApiError) {
            return sendUnauthorized(res, error.message);
        }
        return sendUnauthorized(res, "Invalid or expired token");
    }
};

export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return sendUnauthorized(res, "Authentication required");
        }
        const userRole = req.user.roleSlug?.toLowerCase();
        if (!allowedRoles.map((r) => r.toLowerCase()).includes(userRole)) {
            return sendForbidden(
                res,
                `Access denied. Required roles: ${allowedRoles.join(", ")}`
            );
        }
        next();
    };
};

export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return next();
        }
        const token = authHeader.split(" ")[1];

        if (!token) {
            return next();
        }
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || "your-access-secret-key");
        const user = await userRepository.findById(decoded.userId);

        if (user && user.isActive) {
            const authUser = buildReqUserFromDecoded(decoded);
            if (authUser) {
                req.user = authUser;
            }
        }
        next();
    } catch (error) {
        // Token is invalid, but we don't fail - just continue without user
        next();
    }
};

// Special middleware for logout - accepts expired tokens
export const authenticateForLogout = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return sendUnauthorized(res, "Access token is required");
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            return sendUnauthorized(res, "Access token is required");
        }
        // Decode token WITHOUT verification to allow expired tokens
        const decoded = jwt.decode(token);
        if (!decoded || !decoded.userId) {
            return sendUnauthorized(res, "Invalid token format");
        }
        // Check if user still exists
        const user = await userRepository.findById(decoded.userId);

        if (!user) {
            return sendUnauthorized(res, "User no longer exists");
        }
        // Logout only needs a stable user id (tokens may predate role claim migration).
        req.user = { userId: decoded.userId };
        if (process.env.NODE_ENV === "development") {
            console.log("[Auth For Logout] User set in req.user:", req.user);
        }
        next();
    } catch (error) {
        if (error instanceof ApiError) {
            return sendUnauthorized(res, error.message);
        }
        return sendUnauthorized(res, "Invalid token");
    }
};

const rateLimitStore = new Map();

export const rateLimit = (options = {}) => {
    const {
        windowMs = 15 * 60 * 1000, 
        max = 5, 
        message = "Too many requests, please try again later after 15 minutes.",
    } = options;
    
    setInterval(() => {
        const now = Date.now();
        for (const [key, value] of rateLimitStore.entries()) {
            if (now - value.startTime > windowMs) {
                rateLimitStore.delete(key);
            }
        }
    }, windowMs);

    return (req, res, next) => {
        const key = req.ip || req.connection.remoteAddress;
        const now = Date.now();
        if (!rateLimitStore.has(key)) {
            rateLimitStore.set(key, {
                count: 1,
                startTime: now,
            });
            return next();
        }

        const record = rateLimitStore.get(key);
        if (now - record.startTime > windowMs) {
            // Reset window
            rateLimitStore.set(key, {
                count: 1,
                startTime: now,
            });
            return next();
        }

        if (record.count >= max) {
            return res.status(429).json({
                statusCode: 429,
                success: false,
                message,
                data: null,
            });
        }
        record.count++;
        next();
    };
};

export default {
    authenticate,
    authorize,
    optionalAuth,
    authenticateForLogout,
    rateLimit,
};
