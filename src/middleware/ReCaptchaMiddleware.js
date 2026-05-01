import { sendError } from "../utils/apiResponse.js";

const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY;
const RECAPTCHA_THRESHOLD = parseFloat(process.env.RECAPTCHA_THRESHOLD || "0.5");

export const verifyReCaptcha = async (req, res, next) => {
    try {
        if (!RECAPTCHA_SECRET) {
            if (process.env.NODE_ENV === "development") {
                console.warn(" RECAPTCHA_SECRET_KEY not set — skipping verification in dev mode");
                return next();
            }
            throw new Error("reCAPTCHA is not configured on the server");
        }
        const recaptchaToken = req.body?.recaptchaToken;
        if (!recaptchaToken) {
            return sendError(res, 400, "reCAPTCHA token is required");
        }

        // Call Google reCAPTCHA verification API
        const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `secret=${RECAPTCHA_SECRET}&response=${recaptchaToken}`,
        });

        if (!response.ok) {
            console.error(" reCAPTCHA API error:", response.statusText);
            return sendError(res, 500, "Failed to verify reCAPTCHA");
        }

        const data = await response.json();

        if (process.env.NODE_ENV === "development") {
            console.log(" reCAPTCHA response:", { score: data.score, success: data.success, action: data.action });
        }

        // Validation checks
        if (!data.success) {
            return sendError(res, 403, "reCAPTCHA verification failed: request appeared to be automated");
        }

        if (data.score < RECAPTCHA_THRESHOLD) {
            return sendError(res, 403, `reCAPTCHA score too low (${data.score}). Please try again as a human.`);
        }

        // Attach score to request for optional logging/analytics
        req.recaptchaScore = data.score;
        next();
    } catch (error) {
        console.error(" reCAPTCHA middleware error:", error.message);
        return sendError(res, 500, "reCAPTCHA verification error");
    }
};
