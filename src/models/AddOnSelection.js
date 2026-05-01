import mongoose from "mongoose";

const addOnSelectionItemSchema = new mongoose.Schema(
    {
        addOnServiceId: { type: mongoose.Schema.Types.ObjectId, ref: "AddOnService", required: true },
        quantity: { type: Number, default: 1, min: 1 },
        notes: { type: String, default: "", trim: true },
        priceSnapshot: {
            pricingModel: { type: String, enum: ["fixed", "usage_based"], required: true },
            unitLabel: { type: String, default: "", trim: true },
            price: { type: Number, default: 0 },
            rate: { type: Number, default: 0 },
            currency: { type: String, default: "SAR" },
        },
    },
    { _id: false }
);

const addOnSelectionSchema = new mongoose.Schema(
    {
        bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true, unique: true, index: true },
        items: { type: [addOnSelectionItemSchema], default: () => ([]) },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    },
    { timestamps: true }
);

const AddOnSelection = mongoose.model("AddOnSelection", addOnSelectionSchema);
export default AddOnSelection;

