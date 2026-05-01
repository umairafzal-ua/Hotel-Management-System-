import crypto from "crypto";
import jwt from "jsonwebtoken";
import { userRepository, refreshTokenRepository } from "../../repositories/UserRepository.js";
import {
    getActiveEmployeeByUserId,
    getEmployeeGateByUserId,
} from "../../repositories/EmployeeRepository.js";
import { ApiError, HttpStatus } from "../../utils/apiResponse.js";
import { buildAccessTokenPayload } from "../../utils/accessTokenPayload.js";

class RefreshTokenService {
    get accessTokenSecret() { return process.env.JWT_ACCESS_SECRET || "your-access-secret-key"; }
    get refreshTokenSecret() { return process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key"; }
    get accessTokenExpiry() { return process.env.JWT_ACCESS_EXPIRY || "15m"; }
    get refreshTokenExpiry() { return process.env.JWT_REFRESH_EXPIRY || "7d"; }

    async execute(refreshToken) {
        // Verify refresh token signature first (fast operation)
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, this.refreshTokenSecret);
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                throw new ApiError(HttpStatus.UNAUTHORIZED, "Refresh token has expired. Please login again.");
            }
            throw new ApiError(HttpStatus.UNAUTHORIZED, "Invalid refresh token");
        }

        // Parallel: Check token exists + Get user (2 DB queries at once)
        const [storedToken, user, employee, employeeGate] = await Promise.all([
            refreshTokenRepository.findValidToken(refreshToken),
            userRepository.findById(decoded.userId),
            getActiveEmployeeByUserId(decoded.userId),
            getEmployeeGateByUserId(decoded.userId),
        ]);

        if (!storedToken) {
            throw new ApiError(HttpStatus.UNAUTHORIZED, "Refresh token is invalid or has been revoked");
        }

        if (!user) {
            throw new ApiError(HttpStatus.UNAUTHORIZED, "User not found");
        }

        if (!user.isActive) {
            throw new ApiError(HttpStatus.FORBIDDEN, "Account is deactivated");
        }

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

        // Generate new tokens (fast - no DB operation)
        const branchId = employee?.branch || null;
        let accessToken;
        try {
            accessToken = this.generateAccessToken(user, branchId);
        } catch (err) {
            throw new ApiError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                err.message || "Cannot refresh session for this account."
            );
        }
        const newRefreshToken = this.generateRefreshToken(user);

        // Parallel: Delete old + Create new token (2 DB operations at once)
        await Promise.all([
            refreshTokenRepository.deleteToken(refreshToken),
            refreshTokenRepository.create({
                token: newRefreshToken,
                user: user._id,
                expiresAt: this.calculateExpiryDate(this.refreshTokenExpiry),
                userAgent: "",
                ipAddress: "",
            })
        ]);

        return {
            accessToken,
            refreshToken: newRefreshToken,
            tokenType: "Bearer",
            expiresIn: this.accessTokenExpiry,
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

export default new RefreshTokenService();
