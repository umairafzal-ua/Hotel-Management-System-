import { Router } from "express";
import {register,login,refreshToken,logout,logoutAll,getMe,getMyPermissions,updateMe,changePassword,forgotPassword,verifyOTP,verifyRegistrationOTP,resendRegistrationOTP,resetPassword} from "../controllers/AuthController.js";
import { authenticate, authenticateForLogout, rateLimit } from '../middleware/AuthMiddleware.js';
import {validate,registerSchema,loginSchema,refreshTokenSchema,changePasswordSchema,updateProfileSchema,forgotPasswordSchema,verifyOTPSchema,verifyRegistrationOTPSchema,resendRegistrationOTPSchema,resetPasswordSchema} from "../services/auth/Validation.js";

const router = Router();

const authRateLimit = rateLimit({
    windowMs: 155 * 60 * 1000, 
    max: 500, 
    message: "Too many authentication attempts. Please try again after 15 minutes.",
});

const generalRateLimit = rateLimit({
    windowMs: 60 * 1000, 
    max: 30, 
    message: "Too many requests. Please slow down.",
});

router.post("/register",generalRateLimit,validate(registerSchema),register);
router.post("/login",authRateLimit,validate(loginSchema),login);
router.post("/refresh-token",generalRateLimit,validate(refreshTokenSchema),refreshToken);
router.post("/forgot-password",authRateLimit,validate(forgotPasswordSchema),forgotPassword);
router.post("/verify-otp",authRateLimit,validate(verifyOTPSchema),verifyOTP);
router.post("/verify-registration-otp",authRateLimit,validate(verifyRegistrationOTPSchema),verifyRegistrationOTP);
router.post("/resend-registration-otp",authRateLimit,validate(resendRegistrationOTPSchema),resendRegistrationOTP);
router.post("/reset-password",authRateLimit,validate(resetPasswordSchema),resetPassword);
router.post("/logout",authenticateForLogout,logout);
router.post("/logout-all",authenticateForLogout,logoutAll);
router.get("/me",authenticate,getMe);
router.get("/me/permissions",authenticate,getMyPermissions);
router.put("/me",authenticate,validate(updateProfileSchema),updateMe);
router.post("/change-password",authenticate,validate(changePasswordSchema),changePassword);

export default router;
