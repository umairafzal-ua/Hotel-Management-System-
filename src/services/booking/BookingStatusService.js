import Room from "../../models/Room.js";
import { getCurrentConfirmedBookings } from "../../repositories/BookingRepository.js";

class BookingStatusService {
    async refreshRoomOperationalStatus(roomId, session = null) {
        const room = await Room.findById(roomId).session(session);

        if (!room) {
            return null;
        }

        if (["maintenance", "cleaning"].includes(room.status)) {
            return room;
        }

        const currentBookings = await getCurrentConfirmedBookings(roomId, session);
        const occupiedNow = currentBookings.reduce((acc, booking) => acc + (booking.allocatedSlots || 0), 0);
        const nextStatus = occupiedNow >= room.capacity ? "occupied" : "available";

        if (room.status !== nextStatus) {
            room.status = nextStatus;
            await room.save({ session });
        }

        return room;
    }
}

export default new BookingStatusService();
