import User from "../models/User.js";
import Role from "../models/Role.js";
import RefreshToken from "../models/RefreshToken.js";

class UserRepository {
    /* Create a new user*/
    async create(userData) {
        const user = new User(userData);
        return await user.save();
    }

    /** Find user by ID*/
    async findById(id) {
        return await User.findActiveById(id);
    }

    /** Find user by ID for authentication (lightweight, no population) */
    async findByIdForAuth(id) {
        return await User.findByIdForAuth(id);
    }

    /** Find user by email*/
    async findByEmail(email) {
        return await User.findOne({ email: email.toLowerCase() }).populate("role");
    }

    /** Find user by email with password (for authentication)*/
    async findByEmailWithPassword(email) {
        return await User.findByEmailWithPassword(email);
    }

    /** Find user by email with OTP field (for password reset)*/
    async findByEmailWithOTP(email) {
        return await User.findByEmailWithOTP(email);
    }

    /** Find user by email with registration verification OTP field */
    async findByEmailWithVerificationOTP(email) {
        return await User.findByEmailWithVerificationOTP(email);
    }

    /*Check if email exists*/
    async emailExists(email) {
        const user = await User.findOne({ email: email.toLowerCase() });
        return !!user;
    }

    /** Update user by ID*/
    async updateById(id, updateData) {
        return await User.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).populate("role");
    }

    /*Update last login timestamp*/
    async updateLastLogin(id) {
        return await User.findByIdAndUpdate(
            id,
            { lastLogin: new Date() },
            { new: true }
        );
    }

    /*Create password reset token*/
    async createPasswordResetToken(userId) {
        const user = await User.findById(userId);
        if (!user) return null;
        
        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });
        
        return resetToken;
    }

    /*Find user by reset token*/
    async findByResetToken(hashedToken) {
        return await User.findByResetToken(hashedToken);
    }

    /*Find user by verified reset token (after OTP verification)*/
    async findByVerifiedResetToken(hashedToken) {
        return await User.findByVerifiedResetToken(hashedToken);
    }

    /*Deactivate user*/
    async deactivate(id) {
        return await User.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );
    }

    /*Activate user*/
    async activate(id) {
        return await User.findByIdAndUpdate(
            id,
            { isActive: true },
            { new: true }
        );
    }

    /*Delete user permanently*/
    async delete(id) {
        return await User.findByIdAndDelete(id);
    }

    /*Find all users with pagination*/
    async findAll(options = {}) {
        const {
            page = 1,
            limit = 10,
            sortBy = "createdAt",
            sortOrder = "desc",
            filter = {},
        } = options;

        const skip = (page - 1) * limit;
        const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

        const [users, total] = await Promise.all([
            User.find(filter)
                .populate("role")
                .sort(sort)
                .skip(skip)
                .limit(limit),
            User.countDocuments(filter),
        ]);

        return {
            users,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalUsers: total,
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1,
            },
        };
    }
}

class RoleRepository {
    /*Find role by name*/
    async findByName(name) {
        return await Role.findByName(name);
    }

    /*Find role by ID*/
    async findById(id) {
        return await Role.findById(id);
    }

    /*Get all active roles*/
    async findAll() {
        return await Role.find({ isActive: true });
    }

    /*Initialize default roles*/
    async initializeDefaults() {
        return await Role.initializeDefaultRoles();
    }
}

class RefreshTokenRepository {
    /*Create a new refresh token*/
    async create(tokenData) {
        const refreshToken = new RefreshToken(tokenData);
        return await refreshToken.save();
    }

    /*Find valid token*/
    async findValidToken(token) {
        return await RefreshToken.findValidToken(token);
    }

    /*Revoke token*/
    async revokeToken(token) {
        return await RefreshToken.revokeToken(token);
    }

    /*Revoke all user tokens*/
    async revokeAllUserTokens(userId) {
        return await RefreshToken.revokeAllUserTokens(userId);
    }

    /*Cleanup expired tokens*/
    async cleanupExpired() {
        return await RefreshToken.cleanupExpiredTokens();
    }

    /*Delete all tokens for a user (logout from all devices)*/
    async deleteAllUserTokens(userId) {
        return await RefreshToken.deleteAllUserTokens(userId);
    }

    /*Delete a single token*/
    async deleteToken(token) {
        return await RefreshToken.deleteToken(token);
    }
}

export const userRepository = new UserRepository();
export const roleRepository = new RoleRepository();
export const refreshTokenRepository = new RefreshTokenRepository();

export default {userRepository,roleRepository,refreshTokenRepository};
