import * as roomRepository from "../../repositories/RoomRepository.js";

class ToggleRoomStatusService {
    async execute(id) {
        if (!id) {
            throw new Error("Room ID is required");
        }

        const room = await roomRepository.getRoomByIdIncludingInactive(id);
        
        if (!room) {
            throw new Error("Room not found");
        }

        // Toggle isActive flag
        return await roomRepository.toggleRoomActive(id);
    }
}

export default new ToggleRoomStatusService();
