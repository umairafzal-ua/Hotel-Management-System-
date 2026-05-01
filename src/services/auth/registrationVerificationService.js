import { userRepository } from "../../repositories/UserRepository.js";
import { queueRegistrationOTPEmail } from "../../queues/EmailQueue.js";
import { ApiError, HttpStatus } from "../../utils/apiResponse.js";
import registerService from "./registerService.js";

class RegistrationVerificationService {
    async verifyOTP(email, otp, requestInfo = {}) {
        const user = await userRepository.findByEmailWithVerificationOTP(email);

        if (!user) {
            throw new ApiError(HttpStatus.NOT_FOUND, "User not found");
        }

        if (user.isEmailVerified) {
            return {
                ...(await registerService.createSession(user, requestInfo)),
                message: "Email is already verified.",
            };
        }

        if (!user.verifyEmailVerificationOTP(otp)) {
            throw new ApiError(HttpStatus.BAD_REQUEST, "Invalid or expired OTP");
        }

        user.isEmailVerified = true;
        user.clearEmailVerificationOTP();
        await user.save({ validateBeforeSave: false });

        return {
            ...(await registerService.createSession(user, requestInfo)),
            message: "Email verified successfully.",
        };
    }

    async resendOTP(email) {
        const user = await userRepository.findByEmailWithVerificationOTP(email);

        if (!user) {
            throw new ApiError(HttpStatus.NOT_FOUND, "User not found");
        }

        if (user.isEmailVerified) {
            return {
                success: true,
                message: "Email is already verified. Please login.",
            };
        }

        const otp = user.generateEmailVerificationOTP();
        await user.save({ validateBeforeSave: false });
        await queueRegistrationOTPEmail(user.email, otp, user.fullName);

        return {
            success: true,
            message: "A new verification OTP has been sent to your email.",
        };
    }
}

export default new RegistrationVerificationService();
