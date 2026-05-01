import { Worker } from "bullmq";
import IORedis from "ioredis";
import { emailService } from "../services/email/EmailService.js";

let emailWorker = null;

// Create Redis connection for worker
const connection = new IORedis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null,
    family: 4, 
    retryStrategy: () => {
        return null;
    },
    enableReadyCheck: false,
    enableOfflineQueue: false,
});

// Only create worker if Redis is available
connection.on("connect", () => {
    if (!emailWorker) {
        console.log(" Email worker initialized");
        emailWorker = new Worker(
            "email",
            async (job) => {
                const { name, data } = job;
                
                console.log(`Processing email job: ${name} (ID: ${job.id})`);
                console.log(`   Attempt ${job.attemptsMade + 1} of ${job.opts.attempts}`);
                
                try {
                    switch (name) {
                        case "sendPasswordResetOTP":
                            await emailService.sendPasswordResetOTP(
                                data.email,
                                data.otp,
                                data.userName
                            );
                            console.log(` Email sent successfully: ${data.email}`);
                            break;
                        case "sendRegistrationOTP":
                            await emailService.sendRegistrationOTP(
                                data.email,
                                data.otp,
                                data.userName
                            );
                            console.log(` Registration OTP email sent successfully: ${data.email}`);
                            break;
                        case "sendEmployeeCredentials":
                            await emailService.sendEmployeeCredentials(
                                data.email,
                                data.userName,
                                data.tempPassword
                            );
                            console.log(` Email sent successfully: ${data.email}`);
                            break;
                        case "sendContactUsEmail":
                            await emailService.sendContactUsEmail({
                                fullName: data.fullName,
                                email: data.email,
                                subject: data.subject,
                                message: data.message,
                            });
                            console.log(` Contact Us email sent successfully: ${data.email}`);
                            break;
                        
                        default:
                            throw new Error(`Unknown email job type: ${name}`);
                    }
                    
                    return { success: true, email: data.email };
                } catch (error) {
                    console.error(` Email job failed: ${error.message}`);
                    
                    if (job.attemptsMade >= job.opts.attempts - 1) {
                        console.error(` Email job permanently failed after ${job.opts.attempts} attempts`);
                        console.error(`   Email: ${data.email}`);
                        console.error(`   Error: ${error.message}`);
                    }
                    
                    throw error;
                }
            },
            {
                connection,
                concurrency: 5,
                limiter: {
                    max: 100,
                    duration: 60000,
                },
            }
        );

        // Worker event handlers
        emailWorker.on("completed", (job) => {
            console.log(` Job ${job.id} completed successfully`);
        });

        emailWorker.on("failed", (job, err) => {
            console.error(` Job ${job?.id} failed with error: ${err.message}`);
        });

        emailWorker.on("error", (error) => {
            console.error(" Email worker error:", error.message);
        });
    }
});

connection.on("error", (error) => {
    console.warn(" Email worker will not be available (Redis not connected)");
});

/**
 * Graceful shutdown
 */
export const shutdownEmailWorker = async () => {
    if (emailWorker) {
        console.log("Shutting down email worker...");
        await emailWorker.close();
    }
    await connection.quit();
    console.log(" Email worker shut down successfully");
};

export default emailWorker;
