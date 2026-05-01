import { refreshTokenRepository } from "../../repositories/UserRepository.js";
import { ApiError, HttpStatus } from "../../utils/apiResponse.js";

class LogoutService {
    async logout(userId) {
        // Delete all refresh tokens for the user (logout from all devices)
        await refreshTokenRepository.deleteAllUserTokens(userId);
        return { message: "Logged out successfully from all devices" };
    }

    async logoutAll(userId) {
        // Same as logout - kept for backward compatibility
        await refreshTokenRepository.deleteAllUserTokens(userId);
        return { message: "Logged out from all devices successfully" };
    }
}

export default new LogoutService();
