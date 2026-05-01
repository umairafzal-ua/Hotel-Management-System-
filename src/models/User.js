import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        phoneNumber: {
            type: String,
            required: true,
            trim: true,
        },
        password: {
            type: String,
            required: false,
            select: false,
            default: null,
        },
        role: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role",
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        isTemporaryPassword: {
            type: Boolean,
            default: false,
        },
        agreeToTerms: {
            type: Boolean,
            required: true,
            default: false,
        },
        lastLogin: {
            type: Date,
            default: null,
        },
        passwordChangedAt: {
            type: Date,
            default: null,
        },
        passwordResetToken: {
            type: String,
            default: null,
        },
        passwordResetExpires: {
            type: Date,
            default: null,
        },
        resetPasswordOTP: {
            type: String,
            default: null,
            select: false,
        },
        resetPasswordOTPExpiry: {
            type: Date,
            default: null,
        },
        resetVerifiedToken: {
            type: String,
            default: null,
            select: false,
        },
        resetVerifiedTokenExpiry: {
            type: Date,
            default: null,
        },
        emailVerificationOTP: {
            type: String,
            default: null,
            select: false,
        },
        emailVerificationOTPExpiry: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform: function (doc, ret) {
                delete ret.password;
                delete ret.__v;
                delete ret.passwordResetToken;
                delete ret.passwordResetExpires;
                delete ret.resetPasswordOTP;
                delete ret.resetVerifiedToken;
                delete ret.emailVerificationOTP;
                return ret;
            },
        },
    }
);

userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }
    // Skip hashing if password is null (user created by admin, will set via password reset)
    if (this.password === null || this.password === undefined) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    if (!this.isNew) {
        this.passwordChangedAt = Date.now() - 1000;
    }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.changedPasswordAfter = function (tokenIssuedAt) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return tokenIssuedAt < changedTimestamp;
    }
    return false;
};

userSchema.statics.findByEmailWithPassword = function (email) {
    return this.findOne({ email: email.toLowerCase() }).select("+password").populate("role");
};

userSchema.statics.findByEmailWithOTP = function (email) {
    return this.findOne({ email: email.toLowerCase() }).select("+resetPasswordOTP").populate("role");
};

userSchema.statics.findByEmailWithVerificationOTP = function (email) {
    return this.findOne({ email: email.toLowerCase() }).select("+emailVerificationOTP").populate("role");
};

userSchema.statics.findActiveById = function (id) {
    return this.findOne({ _id: id, isActive: true }).populate("role");
};

// Lightweight method for auth middleware - no population, only needed fields
userSchema.statics.findByIdForAuth = function (id) {
    return this.findOne({ _id: id })
        .select('isActive passwordChangedAt')
        .lean();
};

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString("hex");

    this.passwordResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    // Token expires in 10 minutes
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    
    return resetToken;
};

userSchema.statics.findByResetToken = function (hashedToken) {
    return this.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    }).populate("role");
};

userSchema.methods.generatePasswordResetOTP = function () {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.resetPasswordOTP = crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");
    
    this.resetPasswordOTPExpiry = Date.now() + 10 * 60 * 1000;
    
    return otp;
};

userSchema.methods.verifyPasswordResetOTP = function (otp) {
    const hashedOTP = crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");
    
    return (
        this.resetPasswordOTP === hashedOTP &&
        this.resetPasswordOTPExpiry > Date.now()
    );
};

/**
 * Clear OTP after reset
 */
userSchema.methods.clearPasswordResetOTP = function () {
    this.resetPasswordOTP = null;
    this.resetPasswordOTPExpiry = null;
};

/**
 * Generate temporary reset token after OTP verification
 */
userSchema.methods.generateResetVerifiedToken = function () {
    const token = crypto.randomBytes(32).toString("hex");
    this.resetVerifiedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
    // Token expires in 5 minutes
    this.resetVerifiedTokenExpiry = Date.now() + 5 * 60 * 1000;
    return token;
};

/**
 * Verify reset token
 */
userSchema.methods.verifyResetToken = function (token) {
    const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
    
    return (
        this.resetVerifiedToken === hashedToken &&
        this.resetVerifiedTokenExpiry > Date.now()
    );
};

/**
 * Clear reset token after password reset
 */
userSchema.methods.clearResetToken = function () {
    this.resetVerifiedToken = null;
    this.resetVerifiedTokenExpiry = null;
};

userSchema.methods.generateEmailVerificationOTP = function () {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.emailVerificationOTP = crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");

    this.emailVerificationOTPExpiry = Date.now() + 10 * 60 * 1000;

    return otp;
};

userSchema.methods.verifyEmailVerificationOTP = function (otp) {
    const hashedOTP = crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");

    return (
        this.emailVerificationOTP === hashedOTP &&
        this.emailVerificationOTPExpiry > Date.now()
    );
};

userSchema.methods.clearEmailVerificationOTP = function () {
    this.emailVerificationOTP = null;
    this.emailVerificationOTPExpiry = null;
};

userSchema.statics.findByVerifiedResetToken = function (hashedToken) {
    return this.findOne({
        resetVerifiedToken: hashedToken,
        resetVerifiedTokenExpiry: { $gt: Date.now() },
    }).select("+resetVerifiedToken").populate("role");
};

const User = mongoose.model("User", userSchema);

export default User;
