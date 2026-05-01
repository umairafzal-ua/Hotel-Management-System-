import { Queue } from "bullmq";
import IORedis from "ioredis";

let emailQueue = null;
let isRedisAvailable = false;

// Create Redis connection
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

// Handle Redis connection events
connection.on("connect", () => {
    console.log("Redis connected for email queue");
    isRedisAvailable = true;
});

connection.on("error", (error) => {
    console.warn("Redis connection error:", error.message);
    console.log("Email queue will use direct sending (fallback mode)");
    isRedisAvailable = false;
});

connection.on("close", () => {
    isRedisAvailable = false;
});

// Create email queue only if Redis is available
try {
    emailQueue = new Queue("email", {
        connection,
        defaultJobOptions: {
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 2000,
            },
            removeOnComplete: {
                age: 24 * 3600,
                count: 1000,
            },
            removeOnFail: {
                age: 7 * 24 * 3600,
            },
        },
    });
} catch (error) {
    console.warn(" Could not initialize email queue:", error.message);
}

/**
 * Add password reset OTP email to queue
 */
export const queuePasswordResetEmail = async (email, otp, userName) => {
    if (isRedisAvailable && emailQueue) {
        try {
            const job = await emailQueue.add(
                "sendPasswordResetOTP",
                {
                    email,
                    otp,
                    userName,
                },
                {
                    priority: 1,
                }
            );  
            console.log(` Email job added to queue: ${job.id}`);
            return job;
        } catch (error) {
            console.warn("Failed to add email to queue, using direct send:", error.message);
            // Fall back to direct email
            const { emailService } = await import("../services/email/EmailService.js");
            return await emailService.sendPasswordResetOTP(email, otp, userName);
        }
    } else {
        // Redis not available, send email directly
        console.log(" Sending email directly (queue not available)");
        const { emailService } = await import("../services/email/EmailService.js");
        return await emailService.sendPasswordResetOTP(email, otp, userName);
    }
};

/**
 * Add registration verification OTP email to queue
 */
export const queueRegistrationOTPEmail = async (email, otp, userName) => {
    if (isRedisAvailable && emailQueue) {
        try {
            const job = await emailQueue.add(
                "sendRegistrationOTP",
                {
                    email,
                    otp,
                    userName,
                },
                {
                    priority: 1,
                }
            );
            console.log(` Email job added to queue: ${job.id}`);
            return job;
        } catch (error) {
            console.warn("Failed to add registration OTP email to queue, using direct send:", error.message);
            const { emailService } = await import("../services/email/EmailService.js");
            return await emailService.sendRegistrationOTP(email, otp, userName);
        }
    } else {
        console.log(" Sending registration OTP email directly (queue not available)");
        const { emailService } = await import("../services/email/EmailService.js");
        return await emailService.sendRegistrationOTP(email, otp, userName);
    }
};

/**
 * Add employee credentials email to queue
 */
export const queueEmployeeCredentialsEmail = async (email, userName, tempPassword) => {
    if (isRedisAvailable && emailQueue) {
        try {
            const job = await emailQueue.add(
                "sendEmployeeCredentials",
                {
                    email,
                    userName,
                    tempPassword,
                },
                {
                    priority: 1,
                }
            );
            console.log(` Email job added to queue: ${job.id}`);
            return job;
        } catch (error) {
            console.warn("Failed to add email to queue, using direct send:", error.message);
            const { emailService } = await import("../services/email/EmailService.js");
            return await emailService.sendEmployeeCredentials(email, userName, tempPassword);
        }
    } else {
        console.log(" Sending email directly (queue not available)");
        const { emailService } = await import("../services/email/EmailService.js");
        return await emailService.sendEmployeeCredentials(email, userName, tempPassword);
    }
};

/**
 * Add contact us email to queue
 */
export const queueContactUsEmail = async (contactData) => {
    if (isRedisAvailable && emailQueue) {
        try {
            const job = await emailQueue.add(
                "sendContactUsEmail",
                {
                    fullName: contactData.fullName,
                    email: contactData.email,
                    subject: contactData.subject,
                    message: contactData.message,
                },
                {
                    priority: 2, // Lower priority than password reset
                }
            );
            console.log(` Contact Us email job added to queue: ${job.id}`);
            return job;
        } catch (error) {
            console.warn("Failed to add contact us email to queue, using direct send:", error.message);
            const { emailService } = await import("../services/email/EmailService.js");
            return await emailService.sendContactUsEmail(contactData);
        }
    } else {
        console.log(" Sending contact us email directly (queue not available)");
        const { emailService } = await import("../services/email/EmailService.js");
        return await emailService.sendContactUsEmail(contactData);
    }
};

/*Get queue statistics*/
export const getQueueStats = async () => {
    if (!isRedisAvailable || !emailQueue) {
        return {
            status: "offline",
            message: "Email queue is in direct send mode (Redis not available)",
        };
    }

    const waiting = await emailQueue.getWaitingCount();
    const active = await emailQueue.getActiveCount();
    const completed = await emailQueue.getCompletedCount();
    const failed = await emailQueue.getFailedCount();
    
    return {
        status: "online",
        waiting,
        active,
        completed,
        failed,
        total: waiting + active + completed + failed,
    };
};

export { emailQueue, isRedisAvailable };
export default emailQueue;
