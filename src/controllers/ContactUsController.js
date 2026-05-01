import { sendSuccess, sendError, sendCreated } from "../utils/apiResponse.js";
import contactUsService from "../services/contactus/ContactUsService.js";

export const submitContactUs = async (req, res) => {
    try {
        if (process.env.NODE_ENV === "development") {
            console.log("📝 Processing contact us submission from:", req.validatedBody.email);
        }

        const result = await contactUsService.execute(req.validatedBody);
        
        return sendCreated(res, result.data, result.message);
    } catch (error) {
        console.error("❌ Contact Us submission error:", error.message);
        
        // Generic error message for security (don't expose internal details)
        return sendError(
            res, 
            500, 
            "Failed to submit your message. Please try again later or contact our support team directly."
        );
    }
};
