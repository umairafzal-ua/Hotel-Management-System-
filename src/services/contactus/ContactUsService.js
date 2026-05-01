import { queueContactUsEmail } from "../../queues/EmailQueue.js";

class ContactUsService {
    async execute(contactData) {
        // Validate required fields
        if (!contactData.fullName || !contactData.email || !contactData.subject || !contactData.message) {
            throw new Error("All required fields must be provided");
        }

        try {
            // Queue the email through BullMQ (with automatic fallback to direct send)
            const result = await queueContactUsEmail(contactData);

            return {
                success: true,
                message: "Your message has been received. We will get back to you soon.",
                data: {
                    name: contactData.fullName,
                    email: contactData.email,
                    subject: contactData.subject,
                    receivedAt: new Date().toISOString(),
                    queued: !!result, // Indicates if email was queued (vs direct send)
                },
            };
        } catch (error) {
            console.error(" Contact Us service error:", error.message);
            throw new Error(`Failed to process contact form: ${error.message}`);
        }
    }
}

export default new ContactUsService();
