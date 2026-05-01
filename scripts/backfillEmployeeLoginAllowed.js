// scripts/setAllEmployeesLoginAllowedTrue.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import Employee from "../src/models/Employee.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI is not set in .env");

  await mongoose.connect(uri);

  const res = await Employee.updateMany({}, { $set: { loginAllowed: true } });

  console.log("Matched:", res.matchedCount ?? res.n ?? 0);
  console.log("Modified:", res.modifiedCount ?? res.nModified ?? 0);

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});