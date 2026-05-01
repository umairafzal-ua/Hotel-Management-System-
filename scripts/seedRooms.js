import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import Branch from "../src/models/Branch.js";
import Room from "../src/models/Room.js";
import Amenity from "../src/models/Amenity.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

function requireEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing env var ${name}`);
    }
    return value;
}

const ROOM_TEMPLATES = [
    {
        roomNumber: "101",
        type: "single",
        floor: 1,
        capacity: 1,
        basePrice: 180,
        genderRestriction: "unrestricted",
        amenityNames: ["WiFi", "Air Conditioning", "Hot Water", "Housekeeping", "Prayer Mats", "Television"],
    },
    {
        roomNumber: "102",
        type: "single",
        floor: 1,
        capacity: 1,
        basePrice: 190,
        genderRestriction: "unrestricted",
        amenityNames: ["WiFi", "Air Conditioning", "Hot Water", "Housekeeping", "Prayer Mats", "Television"],
    },
    {
        roomNumber: "103",
        type: "double",
        floor: 2,
        capacity: 2,
        basePrice: 260,
        genderRestriction: "unrestricted",
        amenityNames: ["WiFi", "Air Conditioning", "Hot Water", "Housekeeping", "Prayer Mats", "Television"],
    },
    {
        roomNumber: "104",
        type: "double",
        floor: 2,
        capacity: 2,
        basePrice: 275,
        genderRestriction: "unrestricted",
        amenityNames: ["WiFi", "Air Conditioning", "Hot Water", "Housekeeping", "Prayer Mats", "Television"],
    },
    {
        roomNumber: "105",
        type: "triple",
        floor: 3,
        capacity: 3,
        basePrice: 340,
        genderRestriction: "unrestricted",
        amenityNames: ["WiFi", "Air Conditioning", "Hot Water", "Housekeeping", "Prayer Mats", "Television"],
    },
    {
        roomNumber: "106",
        type: "quad",
        floor: 3,
        capacity: 4,
        basePrice: 420,
        genderRestriction: "unrestricted",
        amenityNames: ["WiFi", "Air Conditioning", "Hot Water", "Housekeeping", "Prayer Mats", "Television"],
    },
    {
        roomNumber: "107",
        type: "shared",
        floor: 4,
        capacity: 6,
        basePrice: 120,
        genderRestriction: "unrestricted",
        sharedOccupancyPolicy: "mixed",
        amenityNames: ["WiFi", "Air Conditioning", "Hot Water", "Housekeeping", "Prayer Mats"],
    },
    {
        roomNumber: "108",
        type: "shared",
        floor: 4,
        capacity: 6,
        basePrice: 125,
        genderRestriction: "female_only",
        sharedOccupancyPolicy: "individuals_only",
        amenityNames: ["WiFi", "Air Conditioning", "Hot Water", "Housekeeping", "Prayer Mats"],
    },
    {
        roomNumber: "109",
        type: "dormitory",
        floor: 5,
        capacity: 8,
        basePrice: 95,
        genderRestriction: "unrestricted",
        sharedOccupancyPolicy: "mixed",
        amenityNames: ["WiFi", "Air Conditioning", "Hot Water", "Housekeeping", "Prayer Mats"],
    },
    {
        roomNumber: "110",
        type: "group",
        floor: 5,
        capacity: 6,
        basePrice: 560,
        genderRestriction: "unrestricted",
        amenityNames: ["WiFi", "Air Conditioning", "Hot Water", "Housekeeping", "Prayer Mats", "Television"],
    },
];

function getAmenityIdsByName(amenities) {
    return new Map(amenities.map((amenity) => [amenity.name, amenity._id]));
}

async function main() {
    console.log("Seeding realistic room inventory...");

    await mongoose.connect(requireEnv("MONGO_URI"));
    console.log("Connected to MongoDB");

    const branches = await Branch.find({ isActive: true }).sort({ createdAt: 1 }).lean();
    if (!branches.length) {
        throw new Error("No active branches found. Seed branches first.");
    }

    const globalAmenities = await Amenity.find({
        isActive: true,
        branch: null,
        name: { $in: ["WiFi", "Air Conditioning", "Hot Water", "Housekeeping", "Prayer Mats", "Television"] },
    })
        .select("_id name")
        .lean();

    const amenityIdByName = getAmenityIdsByName(globalAmenities);

    for (const requiredName of ["WiFi", "Air Conditioning", "Hot Water", "Housekeeping", "Prayer Mats", "Television"]) {
        if (!amenityIdByName.has(requiredName)) {
            throw new Error(`Required global amenity not found: ${requiredName}. Run meal/amenity seed first.`);
        }
    }

    let createdCount = 0;
    let updatedCount = 0;

    for (const branch of branches) {
        console.log(`\nBranch: ${branch.name}`);

        for (const template of ROOM_TEMPLATES) {
            const amenityIds = template.amenityNames
                .map((name) => amenityIdByName.get(name))
                .filter(Boolean);

            const payload = {
                roomNumber: template.roomNumber,
                type: template.type,
                branch: branch._id,
                floor: template.floor,
                capacity: template.capacity,
                basePrice: template.basePrice,
                amenities: amenityIds,
                image: { url: null, publicId: null },
                status: "available",
                genderRestriction: template.genderRestriction || "unrestricted",
                sharedOccupancyPolicy: template.sharedOccupancyPolicy || "mixed",
                isActive: true,
            };

            const existing = await Room.findOne({ branch: branch._id, roomNumber: template.roomNumber })
                .select("_id")
                .lean();

            await Room.findOneAndUpdate(
                { branch: branch._id, roomNumber: template.roomNumber },
                { $set: payload },
                {
                    upsert: true,
                    new: true,
                    runValidators: true,
                    setDefaultsOnInsert: true,
                }
            );

            if (existing?._id) {
                updatedCount += 1;
                console.log(`  updated room ${template.roomNumber} (${template.type}, cap ${template.capacity})`);
            } else {
                createdCount += 1;
                console.log(`  created room ${template.roomNumber} (${template.type}, cap ${template.capacity})`);
            }
        }
    }

    const summary = await Promise.all(
        branches.map(async (branch) => {
            const count = await Room.countDocuments({ branch: branch._id, isActive: true });
            return { name: branch.name, count };
        })
    );

    console.log("\nRoom seed complete.");
    console.log(`Created: ${createdCount}`);
    console.log(`Updated: ${updatedCount}`);
    for (const item of summary) {
        console.log(`  ${item.name}: ${item.count} active rooms`);
    }

    await mongoose.connection.close();
}

main().catch(async (error) => {
    console.error("Room seed failed:", error);
    try {
        await mongoose.connection.close();
    } catch {}
    process.exit(1);
});
