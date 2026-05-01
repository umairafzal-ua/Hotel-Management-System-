import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
    {
        token: {
            type: String,
            required: true,
            unique: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        isRevoked: {
            type: Boolean,
            default: false,
        },
        userAgent: {
            type: String,
            default: "",
        },
        ipAddress: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

refreshTokenSchema.index({ user: 1 });
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); 

refreshTokenSchema.statics.findValidToken = function (token) {
    return this.findOne({
        token,
        isRevoked: false,
        expiresAt: { $gt: new Date() },
    }).lean();
};

refreshTokenSchema.statics.revokeAllUserTokens = function (userId) {
    return this.updateMany(
        { user: userId, isRevoked: false },
        { isRevoked: true }
    );
};

refreshTokenSchema.statics.revokeToken = function (token) {
    return this.findOneAndUpdate(
        { token },
        { isRevoked: true },
        { new: true }
    );
};

refreshTokenSchema.statics.cleanupExpiredTokens = function () {
    return this.deleteMany({
        $or: [
            { expiresAt: { $lt: new Date() } },
            { isRevoked: true },
        ],
    });
};

refreshTokenSchema.statics.deleteAllUserTokens = function (userId) {
    return this.deleteMany({ user: userId });
};

refreshTokenSchema.statics.deleteToken = function (token) {
    return this.deleteOne({ token });
};

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);

export default RefreshToken;
