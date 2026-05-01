import {
    getGroupBookingByIdRaw,
    updateGroupBookingById,
} from "../../repositories/GroupBookingRepository.js";
import { getGroupBookingById } from "../../repositories/GroupBookingRepository.js";

class UpdateGroupMealAddOnsService {
    async execute(groupId, payload, user) {
        // 1. Load group
        const group = await getGroupBookingByIdRaw(groupId);
        if (!group) {
            throw new Error("Group booking not found");
        }

        // 2. Only confirmed groups accept meal/add-on selection
        if (group.status !== "confirmed") {
            throw new Error("Meal and add-on selections can only be set on confirmed group bookings");
        }

        // 3. Ownership — only group leader (or admin)
        if (String(group.groupLeader) !== String(user.userId)) {
            const isAdmin = typeof user?.role === "string" && user.role.toLowerCase() === "admin";
            if (!isAdmin) {
                throw new Error("Only the group leader can update meal and add-on selections");
            }
        }

        // 4. Build update data
        const updateData = { updatedBy: user.userId };

        if (payload.mealSelection) {
            updateData.mealSelection = {
                planType: payload.mealSelection.planType || group.mealSelection?.planType || "",
                servingMode: payload.mealSelection.servingMode || group.mealSelection?.servingMode || "",
                preferences: {
                    ...(group.mealSelection?.preferences || {}),
                    ...(payload.mealSelection.preferences || {}),
                },
            };
        }

        if (payload.addOnSelections !== undefined) {
            updateData.addOnSelections = payload.addOnSelections;
        }

        // 5. Update
        await updateGroupBookingById(groupId, updateData);

        // 6. Return populated group
        return await getGroupBookingById(groupId);
    }
}

export default new UpdateGroupMealAddOnsService();
