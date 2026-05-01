import crypto from "crypto";
import { userRepository, refreshTokenRepository } from "../../repositories/UserRepository.js";
import { ApiError, HttpStatus } from "../../utils/apiResponse.js";

class ResetPasswordService {
    async verifyOTP(email, otp) {
        const user = await userRepository.findByEmailWithOTP(email);
        
        if (!user) {
            throw new ApiError(HttpStatus.NOT_FOUND, "User not found");
        }

        // Verify OTP
        const isValidOTP = user.verifyPasswordResetOTP(otp);
        
        if (!isValidOTP) {
            throw new ApiError(HttpStatus.BAD_REQUEST, "Invalid or expired OTP");
        }

        // Generate reset token
        const resetToken = user.generateResetVerifiedToken();
        await user.save();

        return { 
            message: "OTP verified successfully. Use the token to reset password.",
            success: true,
            token: resetToken,
        };
    }

    async resetPasswordWithToken(token, newPassword) {
        // Hash the token for lookup
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        // Find user by reset token
        const user = await userRepository.findByVerifiedResetToken(hashedToken);
        
        if (!user) {
            throw new ApiError(HttpStatus.BAD_REQUEST, "Invalid or expired reset token");
        }

        // Update password and clear tokens
        user.password = newPassword;
        user.clearPasswordResetOTP();
        user.clearResetToken();
        await user.save();

        // Revoke all refresh tokens in background (non-blocking)
        // Forces user to login again after password reset
        refreshTokenRepository.revokeAllUserTokens(user._id).catch(err => 
            console.error("Failed to revoke tokens:", err.message)
        );

        return { 
            message: "Password reset successful. Please login with your new password.",
            success: true,
        };
    }

    async resetPasswordWithOTP(email, otp, newPassword) {
        const user = await userRepository.findByEmailWithOTP(email);
        
        if (!user) {
            throw new ApiError(HttpStatus.NOT_FOUND, "User not found");
        }

        // Verify OTP
        const isValidOTP = user.verifyPasswordResetOTP(otp);
        
        if (!isValidOTP) {
            throw new ApiError(HttpStatus.BAD_REQUEST, "Invalid or expired OTP");
        }

        // Update password and clear OTP
        user.password = newPassword;
        user.clearPasswordResetOTP();
        await user.save();

        // Revoke all refresh tokens in background (non-blocking)
        refreshTokenRepository.revokeAllUserTokens(user._id).catch(err => 
            console.error("Failed to revoke tokens:", err.message)
        );

        return { 
            message: "Password reset successful. Please login with your new password.",
            success: true,
        };
    }
}

export default new ResetPasswordService();
