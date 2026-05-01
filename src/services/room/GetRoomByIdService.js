import * as roomRepository from "../../repositories/RoomRepository.js";

class GetRoomByIdService {
    async execute(id) {
        if (!id) {
            throw new Error("Room ID is required");
        }

        const room = await roomRepository.getRoomById(id);
        
        if (!room) {
            throw new Error("Room not found");
        }

        return room;
    }
}

export default new GetRoomByIdService();
