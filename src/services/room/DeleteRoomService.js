import Room from "../../models/Room.js";
import * as roomRepository from "../../repositories/RoomRepository.js";
import { deleteFromCloudinary } from "../../utils/cloudinaryUpload.js";

class DeleteRoomService {
    async execute(id) {
        if (!id) {
            throw new Error("Room ID is required");
        }

        // Get room to check status
        const room = await roomRepository.getRoomByIdIncludingInactive(id);
        
        if (!room) {
            throw new Error("Room not found");
        }

        // Check if room is occupied
        if (room.status === "occupied") {
            throw new Error("Cannot delete room that is currently occupied");
        }

        // Delete image from Cloudinary if it exists
        if (room.image?.publicId) {
            await deleteFromCloudinary(room.image.publicId);
        }

        // Hard delete the room
        return await roomRepository.hardDeleteRoom(id);
    }
}

export default new DeleteRoomService();
