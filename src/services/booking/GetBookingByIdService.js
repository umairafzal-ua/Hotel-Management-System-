import { getBookingById } from "../../repositories/BookingRepository.js";
import { isAdminAuthUser } from "../../utils/authUser.js";

class GetBookingByIdService {
    async execute(bookingId, user) {
        if (!bookingId) {
            throw new Error("Booking ID is required");
        }

        const booking = await getBookingById(bookingId);
        if (!booking) {
            throw new Error("Booking not found");
        }

        const isAdmin = isAdminAuthUser(user);
        if (!isAdmin && user?.branchId && String(booking.branch) !== String(user.branchId)) {
            throw new Error("Branch access denied");
        }

        return booking;
    }
}

export default new GetBookingByIdService();
