import { listGroupBookings } from "../../repositories/GroupBookingRepository.js";

class GetGroupBookingsService {
    async execute(query, user) {
        const page = query.page || 1;
        const perPage = query.per_page || 10;

        if (page < 1 || perPage < 1) {
            throw new Error("Page and per_page must be greater than 0");
        }

        const isAdmin = typeof user?.role === "string" && user.role.toLowerCase() === "admin";

        const filters = {
            status: query.status || undefined,
            fromDate: query.fromDate || undefined,
            toDate: query.toDate || undefined,
        };

        if (isAdmin) {
            // Admin can filter by any branch
            filters.branchId = query.branchId || undefined;
        } else if (user?.branchId) {
            // Branch manager sees only their branch
            filters.branchId = user.branchId;
        } else {
            // Group leader sees only their own groups
            filters.groupLeader = user.userId;
        }

        return await listGroupBookings(filters, page, perPage);
    }
}

export default new GetGroupBookingsService();
