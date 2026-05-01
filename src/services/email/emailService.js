import nodemailer from "nodemailer";

class EmailService {
    constructor() {
        this.transporter = null;
    }

    getTransporter() {
        // Lazy initialization - only create transporter when needed
        if (this.transporter) {
            return this.transporter;
        }
        this.transporter = this.initializeTransporter();
        return this.transporter;
    }

    initializeTransporter() {
        const emailProvider = process.env.EMAIL_PROVIDER || "development";

        if (emailProvider === "gmail" && process.env.GMAIL_EMAIL && process.env.GMAIL_APP_PASSWORD) {
            return nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.GMAIL_EMAIL,
                    pass: process.env.GMAIL_APP_PASSWORD, // Use App Password, not regular password
                },
            });
        }
        else if (emailProvider === "custom" && process.env.SMTP_HOST && process.env.SMTP_USER) {
            return nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT || 587,
                secure: process.env.SMTP_SECURE === "true",
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
        }
        // Development/Testing mode - mock transporter (doesn't actually send emails)
        else {
            console.log("Using mock email service for development (no emails sent)");
            return {
                sendMail: async (mailOptions) => {
                    console.log("\n ===== EMAIL SIMULATION =====");
                    console.log("To:", mailOptions.to);
                    console.log("Subject:", mailOptions.subject);
                    console.log("From:", mailOptions.from);
                    console.log("=============================\n");

                    return {
                        messageId: "mock-" + Date.now(),
                        response: "Mock email sent successfully",
                    };
                },
            };
        }
    }

    /**
     * Send password reset OTP email
     */
    async sendPasswordResetOTP(email, otp, userName) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_FROM || "noreply@doyum.com",
                to: email,
                subject: "Password Reset OTP - Doyum",
                html: this.getPasswordResetTemplate(otp, userName),
            };

            const info = await this.getTransporter().sendMail(mailOptions);

            console.log("Password reset OTP processed successfully");
            console.log("Message ID:", info.messageId);

            return {
                success: true,
                messageId: info.messageId,
                message: "Password reset OTP sent to email",
            };
        } catch (error) {
            console.error("Error sending password reset OTP:", error.message);
            // Log full error in development
            if (process.env.NODE_ENV === "development") {
                console.error("Full error:", error);
            }
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }

    /**
     * Send registration email verification OTP
     */
    async sendRegistrationOTP(email, otp, userName) {
        try {
            if(process.env.NODE_ENV === "development") {
                console.log("OTP",otp);
            }
            
            
            const mailOptions = {
                from: process.env.EMAIL_FROM || "noreply@doyum.com",
                to: email,
                subject: "Verify Your Email - Doyum",
                html: this.getRegistrationOTPTemplate(otp, userName),
            };

            const info = await this.getTransporter().sendMail(mailOptions);

            console.log("Registration OTP processed successfully");
            console.log("Message ID:", info.messageId);

            return {
                success: true,
                messageId: info.messageId,
                message: "Registration OTP sent to email",
            };
        } catch (error) {
            console.error("Error sending registration OTP:", error.message);
            if (process.env.NODE_ENV === "development") {
                console.error("Full error:", error);
            }
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }

    /**
     * Send employee credentials email (temporary password)
     */
    async sendEmployeeCredentials(email, userName, tempPassword) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_FROM || "noreply@doyum.com",
                to: email,
                subject: "Your Doyum Account Credentials",
                html: this.getEmployeeCredentialsTemplate(userName, email, tempPassword),
            };

            const info = await this.getTransporter().sendMail(mailOptions);

            console.log("Employee credentials email processed successfully");
            console.log("Message ID:", info.messageId);

            return {
                success: true,
                messageId: info.messageId,
                message: "Employee credentials sent to email",
            };
        } catch (error) {
            console.error("Error sending employee credentials:", error.message);
            if (process.env.NODE_ENV === "development") {
                console.error("Full error:", error);
            }
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }

    /**
     * HTML template for password reset OTP email
     */
    getPasswordResetTemplate(otp, userName) {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Password Reset OTP</title>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        background-color: #f4f4f4;
                    }
                    .container {
                        max-width: 600px;
                        margin: 20px auto;
                        background-color: #ffffff;
                        border-radius: 12px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                        overflow: hidden;
                    }
                    .header {
                        background: linear-gradient(135deg, #003d7a 0%, #0055a4 100%);
                        color: white;
                        padding: 40px 30px;
                        text-align: center;
                        border-bottom: 5px solid #d4af37;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 28px;
                        color: #d4af37;
                        font-weight: 600;
                        letter-spacing: 1px;
                    }
                    .header-subtitle {
                        color: #ffffff;
                        font-size: 12px;
                        margin-top: 8px;
                        letter-spacing: 2px;
                        text-transform: uppercase;
                    }
                    .content {
                        padding: 40px 30px;
                    }
                    .greeting {
                        font-size: 18px;
                        margin-bottom: 25px;
                        color: #003d7a;
                        font-weight: 600;
                    }
                    .greeting strong {
                        color: #d4af37;
                    }
                    .otp-box {
                        background: linear-gradient(135deg, #f0f4ff 0%, #fff9e6 100%);
                        border: 3px solid #d4af37;
                        border-radius: 12px;
                        padding: 30px;
                        text-align: center;
                        margin: 30px 0;
                        box-shadow: 0 4px 8px rgba(212, 175, 55, 0.1);
                    }
                    .otp-label {
                        color: #003d7a;
                        font-size: 14px;
                        font-weight: 600;
                        margin-bottom: 15px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }
                    .otp-text {
                        font-size: 44px;
                        font-weight: bold;
                        color: #d4af37;
                        letter-spacing: 12px;
                        font-family: 'Courier New', monospace;
                    }
                    .otp-expiry {
                        color: #e74c3c;
                        font-size: 14px;
                        margin-top: 20px;
                        font-weight: 600;
                    }
                    .instructions {
                        background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
                        border-left: 5px solid #d4af37;
                        padding: 20px;
                        margin: 25px 0;
                        border-radius: 8px;
                    }
                    .instructions p {
                        margin: 10px 0;
                        font-size: 15px;
                        color: #003d7a;
                    }
                    .instructions strong {
                        color: #d4af37;
                    }
                    .warning {
                        background-color: #fff3cd;
                        border-left: 5px solid #d4af37;
                        padding: 20px;
                        margin: 25px 0;
                        border-radius: 8px;
                    }
                    .warning p {
                        margin: 10px 0;
                        font-size: 14px;
                        color: #003d7a;
                    }
                    .warning strong {
                        color: #d4af37;
                    }
                    .footer {
                        background: linear-gradient(135deg, #003d7a 0%, #0055a4 100%);
                        padding: 25px 30px;
                        text-align: center;
                        border-top: 3px solid #d4af37;
                        font-size: 12px;
                        color: #ffffff;
                    }
                    .footer p {
                        margin: 8px 0;
                    }
                    .footer-divider {
                        height: 1px;
                        background-color: #d4af37;
                        margin: 10px 0;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1> PASSWORD RESET</h1>
                        <div class="header-subtitle">Doyum Catering</div>
                    </div>
                    
                    <div class="content">
                        <div class="greeting">
                            Hello <strong>${userName}</strong>,
                        </div>
                        
                        <p style="font-size: 16px; color: #555; line-height: 1.8;">
                            We received a request to reset your password. Please use the OTP code below to proceed with resetting your password securely.
                        </p>
                        
                        <div class="otp-box">
                            <div class="otp-label">Your One-Time Password</div>
                            <div class="otp-text">${otp}</div>
                            <div class="otp-expiry">This OTP expires in 10 minutes</div>
                        </div>
                        
                        <div class="instructions">
                            <p><strong> How to use your OTP:</strong></p>
                            <p>1. Visit the password reset page in the Doyum app</p>
                            <p>2. Enter your email address</p>
                            <p>3. Enter the OTP code shown above</p>
                            <p>4. Create a new secure password</p>
                            <p>5. You'll be automatically logged back in</p>
                        </div>
                        
                        <div class="warning">
                            <p><strong>Security Notice:</strong></p>
                            <p>• Never share this OTP with anyone, including Doyum staff</p>
                            <p>• Our team will never ask for your OTP via email or phone</p>
                            <p>• This code is valid for 10 minutes only</p>
                            <p>• If you didn't request this, please ignore this email</p>
                        </div>
                        
                        <p style="font-size: 14px; color: #888; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 20px;">
                            If you didn't request a password reset, you can safely ignore this email. Your account remains secure and protected.
                        </p>
                    </div>
                    
                    <div class="footer">
                        <p><strong>DOYUM CATERING</strong></p>
                        <div class="footer-divider"></div>
                        <p>&copy; ${new Date().getFullYear()} Doyum Catering. All rights reserved.</p>
                        <p style="font-size: 11px; margin-top: 10px;">This is an automated message. Please do not reply to this email.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    /**
     * HTML template for registration OTP email
     */
    getRegistrationOTPTemplate(otp, userName) {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Email Verification OTP</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; }
                    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); overflow: hidden; }
                    .header { background: linear-gradient(135deg, #003d7a 0%, #0055a4 100%); color: white; padding: 40px 30px; text-align: center; border-bottom: 5px solid #d4af37; }
                    .header h1 { margin: 0; font-size: 28px; color: #d4af37; font-weight: 600; letter-spacing: 1px; }
                    .content { padding: 40px 30px; }
                    .greeting { font-size: 18px; margin-bottom: 25px; color: #003d7a; font-weight: 600; }
                    .otp-box { background: linear-gradient(135deg, #f0f4ff 0%, #fff9e6 100%); border: 3px solid #d4af37; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; }
                    .otp-label { color: #003d7a; font-size: 14px; font-weight: 600; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px; }
                    .otp-text { font-size: 44px; font-weight: bold; color: #d4af37; letter-spacing: 12px; font-family: 'Courier New', monospace; }
                    .otp-expiry { color: #e74c3c; font-size: 14px; margin-top: 20px; font-weight: 600; }
                    .warning { background-color: #fff3cd; border-left: 5px solid #d4af37; padding: 20px; margin: 25px 0; border-radius: 8px; }
                    .footer { background: linear-gradient(135deg, #003d7a 0%, #0055a4 100%); padding: 25px 30px; text-align: center; font-size: 12px; color: #ffffff; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>VERIFY YOUR EMAIL</h1>
                        <div>Doyum Hospitality</div>
                    </div>
                    <div class="content">
                        <div class="greeting">Hello <strong>${this.escapeHtml(userName)}</strong>,</div>
                        <p>Please use the OTP code below to verify your email address and finish creating your Doyum account.</p>
                        <div class="otp-box">
                            <div class="otp-label">Your Verification Code</div>
                            <div class="otp-text">${otp}</div>
                            <div class="otp-expiry">This OTP expires in 10 minutes</div>
                        </div>
                        <div class="warning">
                            <p><strong>Security Notice:</strong></p>
                            <p>Never share this OTP with anyone. If you did not create a Doyum account, you can ignore this email.</p>
                        </div>
                    </div>
                    <div class="footer">
                        <p><strong>DOYUM HOSPITALITY</strong></p>
                        <p>&copy; ${new Date().getFullYear()} Doyum. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    /**
     * HTML template for employee credentials email
     */
    getEmployeeCredentialsTemplate(userName, email, tempPassword) {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Your Account Credentials</title>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        background-color: #f4f4f4;
                    }
                    .container {
                        max-width: 600px;
                        margin: 20px auto;
                        background-color: #ffffff;
                        border-radius: 12px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                        overflow: hidden;
                    }
                    .header {
                        background: linear-gradient(135deg, #003d7a 0%, #0055a4 100%);
                        color: white;
                        padding: 32px 24px;
                        text-align: center;
                        border-bottom: 5px solid #d4af37;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 24px;
                        color: #d4af37;
                        font-weight: 600;
                        letter-spacing: 1px;
                    }
                    .content {
                        padding: 32px 24px;
                    }
                    .greeting {
                        font-size: 18px;
                        margin-bottom: 20px;
                        color: #003d7a;
                        font-weight: 600;
                    }
                    .credentials {
                        background: #f7f9fc;
                        border: 1px solid #d4af37;
                        border-radius: 10px;
                        padding: 20px;
                        margin: 20px 0;
                    }
                    .credentials p {
                        margin: 8px 0;
                        font-size: 15px;
                    }
                    .label {
                        color: #003d7a;
                        font-weight: 600;
                    }
                    .warning {
                        background-color: #fff3cd;
                        border-left: 5px solid #d4af37;
                        padding: 16px;
                        margin: 20px 0;
                        border-radius: 8px;
                        font-size: 14px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Doyum Account Created</h1>
                    </div>
                    <div class="content">
                        <div class="greeting">Hello ${userName},</div>
                        <p>Your account has been created by the administrator. Use the credentials below to sign in.</p>
                        <div class="credentials">
                            <p><span class="label">Email:</span> ${email}</p>
                            <p><span class="label">Temporary Password:</span> ${tempPassword}</p>
                        </div>
                        <div class="warning">
                            Please change your password immediately after logging in.
                        </div>
                        <p>If you did not expect this email, please contact support.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    /**
     * Send email verification email
     */
    async sendEmailVerification(email, verificationLink, userName) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_FROM || "noreply@doyum.com",
                to: email,
                subject: "Verify Your Email - Doyum",
                html: this.getEmailVerificationTemplate(verificationLink, userName),
            };

            const info = await this.transporter.sendMail(mailOptions);
            return {
                success: true,
                messageId: info.messageId,
            };
        } catch (error) {
            console.error("Error sending verification email:", error.message);
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }

    /**
     * HTML template for email verification
     */
    getEmailVerificationTemplate(verificationLink, userName) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #667eea; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background-color: #f9f9f9; padding: 20px; }
                    .button { display: inline-block; padding: 12px 30px; background-color: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                    .footer { background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Verify Your Email</h1>
                    </div>
                    <div class="content">
                        <p>Hi ${userName},</p>
                        <p>Thank you for signing up! Please verify your email address by clicking the button below.</p>
                        <a href="${verificationLink}" class="button">Verify Email</a>
                        <p style="margin-top: 30px; font-size: 12px; color: #666;">If you didn't create this account, please ignore this email.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} Doyum. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    /**
     * Send welcome email
     */
    async sendWelcomeEmail(email, userName) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_FROM || "noreply@doyum.com",
                to: email,
                subject: "Welcome to Doyum!",
                html: this.getWelcomeTemplate(userName),
            };

            const info = await this.transporter.sendMail(mailOptions);
            return {
                success: true,
                messageId: info.messageId,
            };
        } catch (error) {
            console.error("Error sending welcome email:", error.message);
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }

    /**
     * HTML template for welcome email
     */
    getWelcomeTemplate(userName) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background-color: #f9f9f9; padding: 30px; }
                    .footer { background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1> Welcome to Doyum!</h1>
                    </div>
                    <div class="content">
                        <p>Hi ${userName},</p>
                        <p>We're excited to have you on board! Your account has been successfully created.</p>
                        <p>You can now log in and start exploring our platform.</p>
                        <p style="margin-top: 30px; font-size: 14px; color: #666;">If you have any questions, feel free to reach out to our support team.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} Doyum. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    /**
     * Send contact us email (both admin and user emails)
     */
    async sendContactUsEmail(contactData) {
        try {
            const adminEmail = process.env.ADMIN_EMAIL || process.env.GMAIL_EMAIL || "admin@doyum.com";

            // Admin notification email
            const adminMailOptions = {
                from: process.env.EMAIL_FROM || "noreply@doyum.com",
                to: adminEmail,
                subject: `[Contact Us] ${contactData.subject}`,
                html: this.getAdminContactUsTemplate(contactData),
                replyTo: contactData.email,
                headers: {
                    "X-Priority": "3",
                    "X-Message-Type": "contact-us-admin",
                },
            };

            // User confirmation email
            const userMailOptions = {
                from: process.env.EMAIL_FROM || "noreply@doyum.com",
                to: contactData.email,
                subject: "We received your message - Doyum",
                html: this.getUserContactUsTemplate(contactData),
                headers: {
                    "X-Priority": "5",
                    "X-Message-Type": "contact-us-confirmation",
                },
            };

            const transporter = this.getTransporter();

            // Send both emails in parallel
            const [adminResult, userResult] = await Promise.all([
                transporter.sendMail(adminMailOptions).catch((err) => {
                    console.error("Failed to send admin notification:", err.message);
                    throw err;
                }),
                transporter.sendMail(userMailOptions).catch((err) => {
                    console.error("Failed to send user confirmation:", err.message);
                    return null;
                }),
            ]);

            console.log("Contact Us emails processed successfully");
            console.log("Admin notification ID:", adminResult.messageId);
            if (userResult) {
                console.log("User confirmation ID:", userResult.messageId);
            }

            return {
                success: true,
                message: "Contact Us emails sent successfully",
                adminMessageId: adminResult.messageId,
                userMessageId: userResult?.messageId || null,
            };
        } catch (error) {
            console.error("Error sending contact us emails:", error.message);
            if (process.env.NODE_ENV === "development") {
                console.error("Full error:", error);
            }
            throw new Error(`Failed to send contact us email: ${error.message}`);
        }
    }

    /**
     * HTML template for admin contact us notification
     */
    getAdminContactUsTemplate(data) {
        const submittedDate = new Date().toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Contact Form Submission</title>
        </head>
        <body style="margin:0;padding:0;font-family:'Poppins',Arial,sans-serif;background-color:#F8F9FA;">
            <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
                <tr><td align="center">
                    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border-radius:8px;overflow:hidden;border:1px solid #E2E8F0;">
                        
                        <!-- Header -->
                        <tr>
                            <td style="background-color:#114B94;padding:24px 28px;text-align:center;">
                                <h1 style="margin:0;font-size:20px;font-weight:600;color:#FFFFFF;letter-spacing:0.5px;">New Contact Submission</h1>
                                <p style="margin:8px 0 0;font-size:12px;color:rgba(255,255,255,0.7);">${submittedDate}</p>
                            </td>
                        </tr>

                        <!-- Body -->
                        <tr>
                            <td style="padding:28px;">
                                
                                <!-- Sender Info -->
                                <p style="margin:0 0 16px;font-size:11px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:1px;">Sender</p>
                                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                                    <tr>
                                        <td style="padding:10px 0;border-bottom:1px solid #E2E8F0;">
                                            <span style="font-size:12px;color:#64748B;">Name</span><br/>
                                            <span style="font-size:14px;color:#1E293B;font-weight:500;">${this.escapeHtml(data.fullName)}</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:10px 0;border-bottom:1px solid #E2E8F0;">
                                            <span style="font-size:12px;color:#64748B;">Email</span><br/>
                                            <a href="mailto:${this.escapeHtml(data.email)}" style="font-size:14px;color:#114B94;font-weight:500;text-decoration:none;">${this.escapeHtml(data.email)}</a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:10px 0;">
                                            <span style="font-size:12px;color:#64748B;">Subject</span><br/>
                                            <span style="font-size:14px;color:#1E293B;font-weight:500;">${this.escapeHtml(data.subject)}</span>
                                        </td>
                                    </tr>
                                </table>

                                <!-- Message -->
                                <p style="margin:0 0 10px;font-size:11px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:1px;">Message</p>
                                <div style="background:#F8F9FA;border:1px solid #E2E8F0;border-radius:6px;padding:16px;font-size:14px;line-height:1.7;color:#1E293B;">
                                    ${this.escapeHtml(data.message).replace(/\n/g, "<br>")}
                                </div>

                                <!-- Reply Button -->
                                <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
                                    <tr>
                                        <td align="center">
                                            <a href="mailto:${this.escapeHtml(data.email)}?subject=Re: ${encodeURIComponent(data.subject)}" style="display:inline-block;background-color:#FFB81C;color:#114B94;padding:12px 32px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">Reply to Customer</a>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="background-color:#114B94;padding:20px 28px;text-align:center;">
                                <p style="margin:0;font-size:14px;font-weight:600;color:#FFFFFF;letter-spacing:1px;">DOYUM</p>
                                <p style="margin:8px 0 0;font-size:11px;color:rgba(255,255,255,0.6);">Â© ${new Date().getFullYear()} Doyum. All rights reserved.</p>
                            </td>
                        </tr>

                    </table>
                </td></tr>
            </table>
        </body>
        </html>
        `;
    }

    /**
     * HTML template for user contact us confirmation
     */
    getUserContactUsTemplate(data) {
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Message Received - Doyum</title>
        </head>
        <body style="margin:0;padding:0;font-family:'Poppins',Arial,sans-serif;background-color:#F8F9FA;">
            <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
                <tr><td align="center">
                    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border-radius:8px;overflow:hidden;border:1px solid #E2E8F0;">
                        
                        <!-- Header -->
                        <tr>
                            <td style="background-color:#114B94;padding:28px;text-align:center;">
                                <h1 style="margin:0;font-size:22px;font-weight:600;color:#FFFFFF;">Message Received &#10003;</h1>
                                <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.8);">Thank you for contacting Doyum</p>
                            </td>
                        </tr>

                        <!-- Body -->
                        <tr>
                            <td style="padding:28px;">
                                
                                <!-- Greeting -->
                                <p style="margin:0 0 20px;font-size:15px;color:#1E293B;">
                                    Hello <strong style="color:#114B94;">${this.escapeHtml(data.fullName)}</strong>,
                                </p>
                                <p style="margin:0 0 24px;font-size:14px;color:#64748B;line-height:1.7;">
                                    We've received your message and our team will get back to you within <strong style="color:#1E293B;">24-48 hours</strong>.
                                </p>

                                <!-- Summary Card -->
                                <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F9FA;border:1px solid #E2E8F0;border-radius:6px;overflow:hidden;margin-bottom:24px;">
                                    <tr>
                                        <td style="padding:16px;">
                                            <p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:1px;">Subject</p>
                                            <p style="margin:0 0 16px;font-size:14px;color:#1E293B;font-weight:500;">${this.escapeHtml(data.subject)}</p>
                                            
                                            <p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:1px;">Your Message</p>
                                            <p style="margin:0;font-size:13px;color:#64748B;line-height:1.7;">${this.escapeHtml(data.message).replace(/\n/g, "<br>")}</p>
                                        </td>
                                    </tr>
                                </table>

                                <!-- What's Next -->
                                <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF8E7;border:1px solid #FFB81C;border-radius:6px;overflow:hidden;">
                                    <tr>
                                        <td style="padding:16px;">
                                            <p style="margin:0 0 10px;font-size:13px;font-weight:600;color:#114B94;">What happens next?</p>
                                            <p style="margin:0;font-size:13px;color:#64748B;line-height:1.8;">
                                                1. Our team reviews your message<br>
                                                2. We'll respond to <strong>${this.escapeHtml(data.email)}</strong><br>
                                                3. For urgent matters, email us at <a href="mailto:support@doyum.com" style="color:#114B94;text-decoration:none;font-weight:500;">support@doyum.com</a>
                                            </p>
                                        </td>
                                    </tr>
                                </table>

                                <!-- Sign off -->
                                <p style="margin:28px 0 0;font-size:14px;color:#1E293B;">
                                    Warm regards,<br>
                                    <strong style="color:#114B94;">The Doyum Team</strong>
                                </p>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="background-color:#114B94;padding:20px 28px;text-align:center;">
                                <p style="margin:0;font-size:14px;font-weight:600;color:#FFFFFF;letter-spacing:1px;">DOYUM</p>
                                <p style="margin:8px 0 0;font-size:11px;color:rgba(255,255,255,0.6);">&copy; ${new Date().getFullYear()} Doyum. All rights reserved.</p>
                            </td>
                        </tr>

                    </table>
                </td></tr>
            </table>
        </body>
        </html>
        `;
    }

    /**
     * Escape HTML special characters to prevent XSS
     */
    escapeHtml(text) {
        if (!text) return "";
        const map = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;",
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
    }
}

export const emailService = new EmailService();
export default emailService;
