import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, "..", ".env") });

// Import models
import Module from "../src/models/Module.js";
import Permission from "../src/models/Permission.js";

const seedDatabase = async () => {
    try {
        console.log("Starting database seeding...\n");

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB\n");

        // Read seed data from JSON file
        const dataPath = path.join(__dirname, "..", "data", "seed-data.json");
        const rawData = fs.readFileSync(dataPath, "utf-8");
        const seedData = JSON.parse(rawData);

        // Clear existing data
        console.log(" Clearing existing data...");
        await Module.deleteMany({});
        await Permission.deleteMany({});
        console.log("Cleared modules and permissions collections\n");

        // Seed modules
        console.log("📦 Seeding modules...");
        const modules = [];
        for (const moduleData of seedData.modules) {
            const module = await Module.createModule(moduleData);
            modules.push(module);
            console.log(`  ✓ Created module: ${module.name}`);
        }
        console.log(`Seeded ${modules.length} modules\n`);

        // Seed permissions (CRUD for each module)
        console.log("Seeding permissions...");
        let permissionCount = 0;
        for (const module of modules) {
            for (const action of seedData.permissionActions) {
                const permission = await Permission.createPermission({
                    module: module._id,
                    action: action,
                    description: `${action.charAt(0).toUpperCase() + action.slice(1)} permission for ${module.name}`,
                });
                permissionCount++;
                console.log(`Created permission: ${module.name} - ${action}`);
            }
        }
        console.log(`Seeded ${permissionCount} permissions\n`);

        console.log("Database seeding completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
};

seedDatabase();
