import * as roomRepository from "../../repositories/RoomRepository.js";

class GetRoomsByFloorService {
    async execute(branchId, floor, page = 1, per_page = 10) {
        if (!branchId) {
            throw new Error("Branch ID is required");
        }

        if (floor === undefined || floor === null) {
            throw new Error("Floor number is required");
        }

        if (page < 1 || per_page < 1) {
            throw new Error("Page and per_page must be greater than 0");
        }

        const skip = (page - 1) * per_page;

        // Get all rooms for this branch and floor
        const allRooms = await roomRepository.getAllActiveRooms(branchId);
        const filteredRooms = allRooms.filter((room) => room.floor === floor);

        // Apply pagination
        const total_items = filteredRooms.length;
        const data = filteredRooms.slice(skip, skip + per_page);

        return {
            page,
            per_page,
            total_items,
            total_pages: Math.ceil(total_items / per_page),
            has_more_pages: page < Math.ceil(total_items / per_page),
            data,
        };
    }
}

export default new GetRoomsByFloorService();
