import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
    {
        roomNumber: {
            type: String,
            required: [true, "Room number is required"],
            trim: true,
        },
        type: {
            type: String,
            enum: {
                values: ["single", "double", "triple", "shared", "dormitory", "group", "quad"],
                message: "Type must be one of: single, double, triple, shared, dormitory, group, quad",
            },
            required: [true, "Room type is required"],
        },
        branch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Branch",
            required: [true, "Branch is required"],
            index: true,
        },
        floor: {
            type: Number,
            required: [true, "Floor number is required"],
        },
        capacity: {
            type: Number,
            required: [true, "Capacity is required"],
            min: [1, "Capacity must be at least 1"],
        },
        basePrice: {
            type: Number,
            required: [true, "Base price is required"],
            min: [0, "Price cannot be negative"],
        },
        amenities: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Amenity",
        }],
        image: {
            url: {
                type: String,
                default: null,
            },
            publicId: {
                type: String,
                default: null,
            },
        },
        status: {
            type: String,
            enum: {
                values: ["available", "occupied", "maintenance", "cleaning"],
                message: "Status must be one of: available, occupied, maintenance, cleaning",
            },
            default: "available",
        },
        genderRestriction: {
            type: String,
            enum: {
                values: ["unrestricted", "male_only", "female_only", "couples_only"],
                message: "Gender restriction must be one of: unrestricted, male_only, female_only, couples_only",
            },
            default: "unrestricted",
        },
        sharedOccupancyPolicy: {
            type: String,
            enum: {
                values: ["mixed", "individuals_only", "couples_only"],
                message: "Shared occupancy policy must be one of: mixed, individuals_only, couples_only",
            },
            default: "mixed",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Compound indexes for performance
roomSchema.index({ roomNumber: 1, branch: 1 }, { unique: true });
roomSchema.index({ branch: 1, isActive: 1 });
roomSchema.index({ branch: 1, type: 1, status: 1 });

// Static Methods
roomSchema.statics.findAllActive = function (branchId) {
    return this.find({ branch: branchId, isActive: true }).sort({ floor: 1, roomNumber: 1 });
};

roomSchema.statics.findByIdActive = function (id) {
    return this.findOne({ _id: id, isActive: true });
};

roomSchema.statics.findByIdIncludingInactive = function (id) {
    return this.findById(id);
};

roomSchema.statics.findByRoomNumber = function (roomNumber, branchId) {
    return this.findOne({ roomNumber, branch: branchId });
};

roomSchema.statics.findAvailableByType = function (branchId, roomType) {
    return this.find({
        branch: branchId,
        type: roomType,
        status: "available",
        isActive: true,
    }).sort({ floor: 1, roomNumber: 1 });
};

roomSchema.statics.createRoom = async function (data) {
    const room = new this(data);
    return await room.save();
};

roomSchema.statics.updateRoomById = async function (id, updateData) {
    return await this.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
    );
};

// Instance Methods
roomSchema.methods.toggleActive = async function () {
    this.isActive = !this.isActive;
    return await this.save();
};

roomSchema.methods.updateStatus = async function (newStatus) {
    this.status = newStatus;
    return await this.save();
};

const Room = mongoose.model("Room", roomSchema);
export default Room;
