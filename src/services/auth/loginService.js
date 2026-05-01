import crypto from "crypto";
import jwt from "jsonwebtoken";
import { userRepository, refreshTokenRepository } from "../../repositories/UserRepository.js";
import {
    getActiveEmployeeByUserId,
    getEmployeeGateByUserId,
} from "../../repositories/EmployeeRepository.js";
import { ApiError, HttpStatus } from "../../utils/apiResponse.js";
import { buildAccessTokenPayload } from "../../utils/accessTokenPayload.js";
import { deriveRoleSlug } from "../../utils/rbacIdentifiers.js";

const isAdminRole = (role) => {
    const slug = role?.slug || deriveRoleSlug(role?.name);
    return String(slug || "").toLowerCase() === "admin";
};

class LoginService {
    get accessTokenSecret() { return process.env.JWT_ACCESS_SECRET || "your-access-secret-key"; }
    get refreshTokenSecret() { return process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key"; }
    get accessTokenExpiry() { return process.env.JWT_ACCESS_EXPIRY || "15m"; }
    get refreshTokenExpiry() { return process.env.JWT_REFRESH_EXPIRY || "7d"; }

    async execute(email, password, requestInfo = {}) {
        // Find user with password
        const user = await userRepository.findByEmailWithPassword(email);
        if (!user) {
            throw new ApiError(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        // Check if user is active
        if (!user.isActive) {
            throw new ApiError(HttpStatus.FORBIDDEN, "Account is deactivated. Please contact support.");
        }

        // Check if user has a role assigned (should exist already when fetched)
        if (!user.role) {
            throw new ApiError(HttpStatus.NOT_FOUND, "User role not found. Please contact administrator.");
        }

        if (!user.isEmailVerified && !isAdminRole(user.role)) {
            throw new ApiError(
                HttpStatus.FORBIDDEN,
                "Please verify your email before logging in."
            );
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            throw new ApiError(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        const employeeGate = await getEmployeeGateByUserId(user._id);
        if (employeeGate) {
            if (!employeeGate.isActive) {
                throw new ApiError(
                    HttpStatus.FORBIDDEN,
                    "Employee account is inactive. Please contact support."
                );
            }
            // Backward-compatible: treat missing loginAllowed as allowed (default=true in schema).
            if (employeeGate.loginAllowed === false) {
                throw new ApiError(
                    HttpStatus.FORBIDDEN,
                    "Login is not allowed for this employee. Please contact support."
                );
            }
        }

        // Resolve branch assignment (1 query) to embed branchId in access token
        const employee = await getActiveEmployeeByUserId(user._id);
        const branchId = employee?.branch || null;

        let accessToken;
        try {
            accessToken = this.generateAccessToken(user, branchId);
        } catch (err) {
            throw new ApiError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                err.message || "Cannot issue access token for this account."
            );
        }
        const refreshToken = this.generateRefreshToken(user);

        // Delete all previous tokens for this user, then create new one (keep only 1 active token)
        await Promise.all([
            refreshTokenRepository.deleteAllUserTokens(user._id),
            // Parallel operation - can be deferred, but keep synchronized for consistency
        ]);

        // Create new refresh token in DB
        await refreshTokenRepository.create({
            token: refreshToken,
            user: user._id,
            expiresAt: this.calculateExpiryDate(this.refreshTokenExpiry),
            userAgent: requestInfo.userAgent || "",
            ipAddress: requestInfo.ipAddress || "",
        });

        // Update last login in background (non-blocking)
        userRepository.updateLastLogin(user._id).catch(err => 
            console.error("Failed to update last login:", err.message)
        );
        
        // Clean up expired/revoked tokens in background (not all tokens)
        refreshTokenRepository.cleanupExpired().catch(err => 
            console.error("Failed to cleanup expired tokens:", err.message)
        );

        return {
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: user.role.name,
                roleId: user.role._id,
                roleSlug: user.role.slug || deriveRoleSlug(user.role.name),
                isEmailVerified: user.isEmailVerified,
                isTemporaryPassword: user.isTemporaryPassword,
                lastLogin: user.lastLogin,
            },
            tokens: {
                accessToken,
                refreshToken,
                tokenType: "Bearer",
                expiresIn: this.accessTokenExpiry,
            },
        };
    }

    generateAccessToken(user, branchId = null) {
        const payload = buildAccessTokenPayload(user, branchId);

        return jwt.sign(payload, this.accessTokenSecret, {
            expiresIn: this.accessTokenExpiry,
            issuer: "doyum-api",
            subject: user._id.toString(),
        });
    }

    generateRefreshToken(user) {
        const payload = {
            userId: user._id,
            type: "refresh",
            tokenId: crypto.randomUUID(),
        };

        return jwt.sign(payload, this.refreshTokenSecret, {
            expiresIn: this.refreshTokenExpiry,
            issuer: "doyum-api",
            subject: user._id.toString(),
        });
    }

    calculateExpiryDate(expiryString) {
        const match = expiryString.match(/^(\d+)([smhd])$/);
        if (!match) {
            return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        }

        const value = parseInt(match[1]);
        const unit = match[2];

        const multipliers = {
            s: 1000,
            m: 60 * 1000,
            h: 60 * 60 * 1000,
            d: 24 * 60 * 60 * 1000,
        };

        return new Date(Date.now() + value * multipliers[unit]);
    }
}

export default new LoginService();
