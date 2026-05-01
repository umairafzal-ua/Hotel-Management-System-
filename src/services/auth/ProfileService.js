import { userRepository } from "../../repositories/UserRepository.js";
import { ApiError, HttpStatus } from "../../utils/apiResponse.js";

class ProfileService {
    async getProfile(userId) {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new ApiError(HttpStatus.NOT_FOUND, "User not found");
        }

        return {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role.name,
            isEmailVerified: user.isEmailVerified,
            isActive: user.isActive,
            isTemporaryPassword: user.isTemporaryPassword,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }

    async updateProfile(userId, updateData) {
        const user = await userRepository.updateById(userId, updateData);
        if (!user) {
            throw new ApiError(HttpStatus.NOT_FOUND, "User not found");
        }

        return {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role.name,
            updatedAt: user.updatedAt,
        };
    }
}

export default new ProfileService();
