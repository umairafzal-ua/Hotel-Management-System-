import * as roomRepository from "../../repositories/RoomRepository.js";

class GetRoomsService {
    async execute(page = 1, per_page = 10, branchId = null, filters = {}) {
        if (page < 1 || per_page < 1) {
            throw new Error("Page and per_page must be greater than 0");
        }

        // If no branchId provided, we need it from the request context
        if (!branchId) {
            throw new Error("Branch ID is required");
        }

        const skip = (page - 1) * per_page;

        // Count total active rooms for this branch
        const total_items = await roomRepository.countActiveRooms(branchId);

        // Get rooms with pagination
        let rooms;
        
        if (filters.type) {
            rooms = await roomRepository.getRoomsByBranchAndType(branchId, filters.type, skip, per_page);
        } else if (filters.status) {
            rooms = await roomRepository.getRoomsByBranchAndStatus(branchId, filters.status, skip, per_page);
        } else {
            rooms = await roomRepository.getAllActiveRooms(branchId, skip, per_page);
        }

        return {
            page,
            per_page,
            total_items,
            total_pages: Math.ceil(total_items / per_page),
            has_more_pages: page < Math.ceil(total_items / per_page),
            data: rooms,
        };
    }
}

export default new GetRoomsService();
