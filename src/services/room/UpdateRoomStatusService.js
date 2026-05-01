import * as roomRepository from "../../repositories/RoomRepository.js";

class UpdateRoomStatusService {
    async execute(id, status) {
        if (!id) {
            throw new Error("Room ID is required");
        }

        if (!status) {
            throw new Error("Status is required");
        }

        // Validate status is one of allowed values
        const validStatuses = ["available", "occupied", "maintenance", "cleaning"];
        if (!validStatuses.includes(status)) {
            throw new Error(`Status must be one of: ${validStatuses.join(", ")}`);
        }

        const room = await roomRepository.getRoomByIdIncludingInactive(id);
        
        if (!room) {
            throw new Error("Room not found");
        }

        // Update status
        return await roomRepository.updateRoomStatus(id, status);
    }
}

export default new UpdateRoomStatusService();
