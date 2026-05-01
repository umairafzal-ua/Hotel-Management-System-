import * as roomRepository from "../../repositories/RoomRepository.js";

class GetPublicRoomsService {
    async execute(page = 1, per_page = 10) {
        if (page < 1 || per_page < 1) {
            throw new Error("Page and per_page must be greater than 0");
        }

        const skip = (page - 1) * per_page;

        const total_items = await roomRepository.countPublicRooms();
        const data = await roomRepository.getAllPublicRooms(skip, per_page);

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

export default new GetPublicRoomsService();
