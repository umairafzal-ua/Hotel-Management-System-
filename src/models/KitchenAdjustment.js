import mongoose from "mongoose";

const kitchenAdjustmentSchema = new mongoose.Schema(
    {
        branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true, index: true },
        date: { type: String, required: true, index: true }, // YYYY-MM-DD
        mealType: { type: String, enum: ["breakfast", "lunch", "dinner"], required: true, index: true },
        deltaQuantity: { type: Number, required: true },
        reason: { type: String, default: "", trim: true },
        bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
);

kitchenAdjustmentSchema.index({ branchId: 1, date: 1, mealType: 1 });

const KitchenAdjustment = mongoose.model("KitchenAdjustment", kitchenAdjustmentSchema);
export default KitchenAdjustment;

