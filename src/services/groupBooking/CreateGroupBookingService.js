import Branch from "../../models/Branch.js";
import { createGroupBooking } from "../../repositories/GroupBookingRepository.js";

class CreateGroupBookingService {
    async execute(payload, user) {
        // Validate branch exists and is active
        const branch = await Branch.findByIdActive(payload.branchId);
        if (!branch) {
            throw new Error("Branch not found or inactive");
        }

        // Validate dates
        const checkIn = new Date(payload.checkInDate);
        const checkOut = new Date(payload.checkOutDate);

        if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
            throw new Error("Invalid check-in or check-out date");
        }
        if (checkOut <= checkIn) {
            throw new Error("Check-out date must be after check-in date");
        }

        // Create group booking with pending status
        const group = await createGroupBooking({
            branch: branch._id,
            groupLeader: user.userId,
            groupName: payload.groupName,
            totalPilgrims: payload.totalPilgrims,
            checkInDate: checkIn,
            checkOutDate: checkOut,
            preferences: payload.preferences || {},
            status: "pending",
            createdBy: user.userId,
            updatedBy: user.userId,
        });

        return group;
    }
}

export default new CreateGroupBookingService();
