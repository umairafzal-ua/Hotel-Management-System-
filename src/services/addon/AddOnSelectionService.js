import * as selectionRepo from "../../repositories/AddOnSelectionRepository.js";
import * as addOnRepo from "../../repositories/AddOnRepository.js";
import Booking from "../../models/Booking.js";

class AddOnSelectionService {
    async upsertForBooking(bookingId, payload, user) {
        const booking = await Booking.findById(bookingId);
        if (!booking) throw new Error("Booking not found");

        const items = [];
        for (const item of payload.items || []) {
            const addOn = await addOnRepo.getAddOnServiceById(item.addOnServiceId);
            if (!addOn) {
                const err = new Error("Add-on not found");
                err.statusCode = 404;
                err.errors = [{ field: "items.addOnServiceId", message: "Add-on not found" }];
                throw err;
            }

            items.push({
                addOnServiceId: addOn._id,
                quantity: item.quantity ?? 1,
                notes: item.notes || "",
                priceSnapshot: {
                    pricingModel: addOn.pricingModel,
                    unitLabel: addOn.unitLabel,
                    price: addOn.price,
                    rate: addOn.rate,
                    currency: "SAR",
                },
            });
        }

        return await selectionRepo.upsertAddOnSelectionByBookingId(bookingId, {
            items,
            createdBy: user.userId,
            updatedBy: user.userId,
        });
    }
}

export default new AddOnSelectionService();

