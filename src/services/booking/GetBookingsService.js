import { isAdminAuthUser } from "../../utils/authUser.js";
import { listBookings } from "../../repositories/BookingRepository.js";

class GetBookingsService {
    async execute(query, user) {
        const page = query.page || 1;
        const per_page = query.per_page || 10;

        if (page < 1 || per_page < 1) {
            throw new Error("Page and per_page must be greater than 0");
        }

        const isAdmin = isAdminAuthUser(user);
        const branchId = isAdmin ? (query.branchId || null) : (user?.branchId || null);

        return await listBookings(
            {
                branchId,
                roomId: query.roomId,
                status: query.status,
                fromDate: query.fromDate ? new Date(query.fromDate) : null,
                toDate: query.toDate ? new Date(query.toDate) : null,
                search: query.search || query.q || null,
            },
            page,
            per_page
        );
    }
}

export default new GetBookingsService();
