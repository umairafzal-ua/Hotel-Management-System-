import Room from "../../models/Room.js";
import {
    getGroupBookingById,
    updateGroupBookingById,
} from "../../repositories/GroupBookingRepository.js";

class GenerateGroupInvoiceService {
    async execute(groupId, user) {
        // 1. Load group with populated bookings
        const group = await getGroupBookingById(groupId);
        if (!group) {
            throw new Error("Group booking not found");
        }

        // 2. Only confirmed groups can have invoices
        if (group.status !== "confirmed") {
            throw new Error("Invoice can only be generated for confirmed group bookings");
        }

        // 3. Branch access check
        const isAdmin = typeof user?.role === "string" && user.role.toLowerCase() === "admin";
        if (!isAdmin && user?.branchId && String(group.branch._id || group.branch) !== String(user.branchId)) {
            throw new Error("Branch access denied");
        }

        // 4. Calculate nights
        const checkIn = new Date(group.checkInDate);
        const checkOut = new Date(group.checkOutDate);
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

        if (nights <= 0) {
            throw new Error("Invalid date range for invoice calculation");
        }

        const lineItems = [];

        // 5. Room charges from child bookings
        for (const booking of group.allocatedBookings || []) {
            if (booking.status === "cancelled") continue;

            const room = booking.room;
            const roomPrice = room?.basePrice || 0;
            const slots = booking.allocatedSlots || 0;
            const amount = roomPrice * slots * nights;

            lineItems.push({
                type: "room",
                description: `Room ${room?.roomNumber || "?"} (${slots} pax × ${nights} nights × ${roomPrice}/slot)`,
                amount,
            });
        }

        // 6. Meal charges
        if (group.mealSelection && group.mealSelection.planType && group.mealSelection.planType !== "none" && group.mealSelection.planType !== "") {
            // Estimate meal rate based on plan type (configurable later via 5.5)
            const mealRates = {
                breakfast_only: 50,
                breakfast_lunch: 100,
                breakfast_dinner: 100,
                lunch_dinner: 100,
                breakfast_lunch_dinner: 150,
                custom: 120,
            };

            const rate = mealRates[group.mealSelection.planType] || 0;
            const pax = group.totalPilgrims;
            const mealAmount = rate * pax * nights;

            lineItems.push({
                type: "meal",
                description: `${group.mealSelection.planType} × ${pax} pax × ${nights} days @ ${rate}/person/day`,
                amount: mealAmount,
            });
        }

        // 7. Add-on charges
        for (const addon of group.addOnSelections || []) {
            const amount = (addon.unitPrice || 0) * (addon.quantity || 0);
            lineItems.push({
                type: "addon",
                description: `${addon.code} × ${addon.quantity} @ ${addon.unitPrice}/unit`,
                amount,
            });
        }

        // 8. Calculate total
        const total = lineItems.reduce((sum, item) => sum + item.amount, 0);

        // 9. Store invoice snapshot
        const invoiceSnapshot = {
            lineItems,
            total,
            generatedAt: new Date(),
        };

        await updateGroupBookingById(groupId, {
            invoiceSnapshot,
            updatedBy: user.userId,
        });

        return {
            groupBookingId: groupId,
            groupName: group.groupName,
            totalPilgrims: group.totalPilgrims,
            nights,
            lineItems,
            total,
            generatedAt: invoiceSnapshot.generatedAt,
        };
    }
}

export default new GenerateGroupInvoiceService();
