import crypto from "crypto";
import jwt from "jsonwebtoken";
import { userRepository, roleRepository, refreshTokenRepository } from "../../repositories/UserRepository.js";
import { ApiError, HttpStatus } from "../../utils/apiResponse.js";
import { buildAccessTokenPayload } from "../../utils/accessTokenPayload.js";
import { deriveRoleSlug } from "../../utils/rbacIdentifiers.js";
import { queueRegistrationOTPEmail } from "../../queues/EmailQueue.js";

class RegisterService {
    get accessTokenSecret() { return process.env.JWT_ACCESS_SECRET || "your-access-secret-key"; }
    get refreshTokenSecret() { return process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key"; }
    get accessTokenExpiry() { return process.env.JWT_ACCESS_EXPIRY || "15m"; }
    get refreshTokenExpiry() { return process.env.JWT_REFRESH_EXPIRY || "7d"; }

    async execute(userData, requestInfo = {}) {
        const { fullName, email, phoneNumber, password, role, agreeToTerms } = userData;

        // Prevent direct admin registration early
        if (role.toLowerCase() === "admin") {
            throw new ApiError(HttpStatus.FORBIDDEN, "Admin registration is not allowed through this endpoint");
        }

        // Run email check + role lookup in parallel (instead of sequential)
        const [existingUser, roleDoc] = await Promise.all([
            userRepository.emailExists(email),
            roleRepository.findByName(role),
        ]);

        // Check results
        if (existingUser) {
            throw new ApiError(HttpStatus.CONFLICT, "Email already registered");
        }

        if (!roleDoc) {
            throw new ApiError(HttpStatus.BAD_REQUEST, "Invalid role selected");
        }

        // Create user with role already populated at creation time
        // Pass role name directly to avoid extra populate query
        const user = await userRepository.create({
            fullName,
            email,
            phoneNumber,
            password,
            role: roleDoc._id,
            agreeToTerms,
        });

        // Manually set role from what we already fetched (avoid DB query)
        user.role = roleDoc;

        const otp = user.generateEmailVerificationOTP();
        await user.save({ validateBeforeSave: false });
        await queueRegistrationOTPEmail(email, otp, fullName);

        return {
            user: this.formatUser(user),
            requiresEmailVerification: true,
            message: "Registration successful. Please verify the OTP sent to your email.",
        };
    }

    async createSession(user, requestInfo = {}) {
        let accessToken;
        try {
            accessToken = this.generateAccessToken(user, null);
        } catch (err) {
            throw new ApiError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                err.message || "Cannot complete registration."
            );
        }
        const refreshToken = this.generateRefreshToken(user);

        // Create refresh token in DB
        await refreshTokenRepository.create({
            token: refreshToken,
            user: user._id,
            expiresAt: this.calculateExpiryDate(this.refreshTokenExpiry),
            userAgent: requestInfo.userAgent || "",
            ipAddress: requestInfo.ipAddress || "",
        });

        // Update last login in background (non-blocking)
        // Don't await this - let it complete after response
        userRepository.updateLastLogin(user._id).catch(err => 
            console.error("Failed to update last login:", err.message)
        );

        return {
            user: this.formatUser(user),
            tokens: {
                accessToken,
                refreshToken,
                tokenType: "Bearer",
                expiresIn: this.accessTokenExpiry,
            },
        };
    }

    formatUser(user) {
        return {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role.name,
            roleId: user.role._id,
            roleSlug: user.role.slug || deriveRoleSlug(user.role.name),
            isEmailVerified: user.isEmailVerified,
            createdAt: user.createdAt,
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

export default new RegisterService();
