import { userRepository, refreshTokenRepository } from "../../repositories/UserRepository.js";
import { ApiError, HttpStatus } from "../../utils/apiResponse.js";

class ChangePasswordService {
    async execute(userId, currentPassword, newPassword) {
        // Get user with password field
        const user = await userRepository.findByEmailWithPassword(
            (await userRepository.findById(userId)).email
        );

        if (!user) {
            throw new ApiError(HttpStatus.NOT_FOUND, "User not found");
        }

        // Verify current password
        const isPasswordValid = await user.comparePassword(currentPassword);
        if (!isPasswordValid) {
            throw new ApiError(HttpStatus.UNAUTHORIZED, "Current password is incorrect");
        }
        // Update password and mark as permanent
        user.password = newPassword;
        user.isTemporaryPassword = false;
        await user.save();

        // Delete all refresh tokens (force re-login on all devices)
        await refreshTokenRepository.deleteAllUserTokens(userId);

        return { message: "Password changed successfully. Please login again." };
    }
}

export default new ChangePasswordService();
