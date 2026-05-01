import mongoose from "mongoose";

const addOnServiceSchema = new mongoose.Schema(
    {
        branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", default: null, index: true },
        name: { type: String, required: true, trim: true },
        description: { type: String, default: "", trim: true },
        pricingModel: { type: String, enum: ["fixed", "usage_based"], default: "fixed" },
        unitLabel: { type: String, default: "", trim: true }, // e.g. trip/kg/service/meal
        price: { type: Number, default: 0 }, // for fixed
        rate: { type: Number, default: 0 },  // for usage_based
        isMandatory: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true, index: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    },
    { timestamps: true }
);

addOnServiceSchema.index({ branchId: 1, isActive: 1 });
addOnServiceSchema.index({ name: 1, branchId: 1 });

const AddOnService = mongoose.model("AddOnService", addOnServiceSchema);
export default AddOnService;

