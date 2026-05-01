import registerService from "../services/auth/RegisterService.js";
import loginService from "../services/auth/LoginService.js";
import refreshTokenService from "../services/auth/RefreshTokenService.js";
import logoutService from "../services/auth/LogoutService.js";
import changePasswordService from "../services/auth/ChangePasswordService.js";
import forgotPasswordService from "../services/auth/ForgotPasswordService.js";
import resetPasswordService from "../services/auth/ResetPasswordService.js";
import registrationVerificationService from "../services/auth/registrationVerificationService.js";
import profileService from "../services/auth/ProfileService.js";
import getMyPermissionsService from "../services/auth/getMyPermissionsService.js";
import { sendSuccess, sendCreated } from "../utils/apiResponse.js";

const getRequestInfo = (req) => ({
    userAgent: req.headers["user-agent"] || "",
    ipAddress: req.ip || req.connection?.remoteAddress || "",
});

export const register = async (req, res, next) => {
    try {
        const result = await registerService.execute(req.validatedBody, getRequestInfo(req));
        return sendCreated(res, result, result.message || "Registration successful");
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.validatedBody;
        const result = await loginService.execute(email, password, getRequestInfo(req));
        return sendSuccess(res, result, "Login successful");
    } catch (error) {
        next(error);
    }
};

export const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.validatedBody;
        const result = await refreshTokenService.execute(refreshToken);
        return sendSuccess(res, result, "Token refreshed successfully");
    } catch (error) {
        next(error);
    }
};

export const logout = async (req, res, next) => {
    try {
        // Use authenticated user's ID from access token
        const result = await logoutService.logout(req.user.userId);
        return sendSuccess(res, result, "Logged out successfully");
    } catch (error) {
        next(error);
    }
};

export const logoutAll = async (req, res, next) => {
    try {
        const result = await logoutService.logoutAll(req.user.userId);
        return sendSuccess(res, result, "Logged out from all devices successfully");
    } catch (error) {
        next(error);
    }
};

export const getMe = async (req, res, next) => {
    try {
        const profile = await profileService.getProfile(req.user.userId);
        return sendSuccess(res, profile, "Profile retrieved successfully");
    } catch (error) {
        next(error);
    }
};

export const getMyPermissions = async (req, res, next) => {
    try {
        const data = await getMyPermissionsService.execute(req.user);
        return sendSuccess(res, data, "Permissions retrieved successfully");
    } catch (error) {
        next(error);
    }
};

export const updateMe = async (req, res, next) => {
    try {
        const profile = await profileService.updateProfile(req.user.userId, req.validatedBody);
        return sendSuccess(res, profile, "Profile updated successfully");
    } catch (error) {
        next(error);
    }
};

export const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.validatedBody;
        const result = await changePasswordService.execute(req.user.userId, currentPassword, newPassword);
        return sendSuccess(res, result, "Password changed successfully");
    } catch (error) {
        next(error);
    }
};

export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.validatedBody;
        const result = await forgotPasswordService.execute(email);
        return sendSuccess(res, result, result.message);
    } catch (error) {
        next(error);
    }
};

export const verifyOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.validatedBody;
        const result = await resetPasswordService.verifyOTP(email, otp);
        return sendSuccess(res, result, result.message);
    } catch (error) {
        next(error);
    }
};

export const verifyRegistrationOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.validatedBody;
        const result = await registrationVerificationService.verifyOTP(email, otp, getRequestInfo(req));
        return sendSuccess(res, result, result.message);
    } catch (error) {
        next(error);
    }
};

export const resendRegistrationOTP = async (req, res, next) => {
    try {
        const { email } = req.validatedBody;
        const result = await registrationVerificationService.resendOTP(email);
        return sendSuccess(res, result, result.message);
    } catch (error) {
        next(error);
    }
};

export const resetPassword = async (req, res, next) => {
    try {
        const { token, newPassword } = req.validatedBody;
        const result = await resetPasswordService.resetPasswordWithToken(token, newPassword);
        return sendSuccess(res, result, result.message);
    } catch (error) {
        next(error);
    }
};

export default {register,login,refreshToken,logout,logoutAll,getMe,getMyPermissions,updateMe,changePassword,forgotPassword,verifyOTP,verifyRegistrationOTP,resendRegistrationOTP,resetPassword};
