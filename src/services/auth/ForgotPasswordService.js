import { userRepository } from "../../repositories/UserRepository.js";
import { queuePasswordResetEmail } from "../../queues/EmailQueue.js";
import { ApiError, HttpStatus } from "../../utils/apiResponse.js";

class ForgotPasswordService {
    async execute(email) {
        const user = await userRepository.findByEmail(email);
        
        // Always return success to prevent email enumeration
        if (!user) {
            return { 
                message: "If the email exists, a password reset OTP has been sent.",
                success: true,
            };
        }

        try {
            const otp = user.generatePasswordResetOTP();

            // Update OTP expiry
            user.resetPasswordOTPExpiry = Date.now() + 10 * 60 * 1000;
            await user.save();

            // Add email to queue instead of sending directly
            await queuePasswordResetEmail(email, otp, user.fullName);

            return { 
                message: "Password reset OTP has been sent to your email",
                success: true,
            };
        } catch (error) {
            console.error("Error in forgotPassword:", error);
            throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to send password reset OTP");
        }
    }
}

export default new ForgotPasswordService();
