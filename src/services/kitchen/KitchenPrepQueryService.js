import Booking from "../../models/Booking.js";
import * as mealSelectionRepo from "../../repositories/MealSelectionRepository.js";
import * as adjustmentRepo from "../../repositories/KitchenAdjustmentRepository.js";

const toDayRange = (yyyyMmDd) => {
    const start = new Date(`${yyyyMmDd}T00:00:00.000Z`);
    const end = new Date(`${yyyyMmDd}T23:59:59.999Z`);
    return { start, end };
};

const computeMealQty = ({ unitMode, booking, mealConfig }) => {
    if (!mealConfig?.enabled) return 0;
    if (typeof mealConfig.quantityOverride === "number") return mealConfig.quantityOverride;
    if (unitMode === "per_room") return 1;
    // per_person or hybrid default to guestCount
    return Number(booking.guestCount || 0);
};

class KitchenPrepQueryService {
    async getPrep({ branchId, date }) {
        const { start, end } = toDayRange(date);

        const bookings = await Booking.find({
            branch: branchId,
            status: "confirmed",
            checkInDate: { $lte: end },
            checkOutDate: { $gt: start },
        })
            .select("_id guestCount checkInDate checkOutDate")
            .lean();

        const bookingIds = bookings.map((b) => b._id);
        const selections = bookingIds.length > 0 ? await mealSelectionRepo.getMealSelectionsForBookingIds(bookingIds) : [];
        const selectionMap = new Map(selections.map((s) => [String(s.bookingId), s]));

        const totals = { breakfast: 0, lunch: 0, dinner: 0 };

        for (const b of bookings) {
            const sel = selectionMap.get(String(b._id));
            const unitMode = sel?.unitMode || "hybrid";
            totals.breakfast += computeMealQty({ unitMode, booking: b, mealConfig: sel?.meals?.breakfast });
            totals.lunch += computeMealQty({ unitMode, booking: b, mealConfig: sel?.meals?.lunch });
            totals.dinner += computeMealQty({ unitMode, booking: b, mealConfig: sel?.meals?.dinner });
        }

        const deltas = await adjustmentRepo.sumAdjustmentsByMealType({ branchId, date });

        return {
            branchId,
            date,
            totals: {
                breakfast: totals.breakfast + (deltas.breakfast || 0),
                lunch: totals.lunch + (deltas.lunch || 0),
                dinner: totals.dinner + (deltas.dinner || 0),
            },
            baseTotals: totals,
            adjustments: deltas,
            contributingBookings: bookings.length,
        };
    }
}

export default new KitchenPrepQueryService();

