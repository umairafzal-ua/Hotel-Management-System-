import { Router } from "express";
import { submitContactUs } from "../controllers/ContactUsController.js";
import { contactUsSchema, validate } from "../services/contactus/Validation.js";
import { verifyReCaptcha } from "../middleware/ReCaptchaMiddleware.js";

const router = Router();

// POST /contact-us: Form validation → reCAPTCHA verification → submit
router.post("/", validate(contactUsSchema), verifyReCaptcha, submitContactUs);

export default router;
