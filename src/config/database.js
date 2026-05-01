import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const options = {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        const conn = await mongoose.connect(process.env.MONGO_URI, options);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        mongoose.connection.on("error", (err) => {
            console.error(`MongoDB connection error: ${err.message}`);
        });

        mongoose.connection.on("disconnected", () => {
            console.warn("MongoDB disconnected. Attempting to reconnect...");
        });

        mongoose.connection.on("reconnected", () => {
            console.log("MongoDB reconnected");
        });

        return conn;
    } catch (error) {
        console.error(`MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
};

// Gracefully the MongoDB connection
export const closeDB = async () => {
    try {
        await mongoose.connection.close();
        console.log("MongoDB connection closed gracefully");
    } catch (error) {
        console.error(`Error closing MongoDB connection: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;