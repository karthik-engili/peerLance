/**
 * @file db.js
 * @description MongoDB connection configuration using Mongoose.
 * Exports a reusable connect function for the server entry point.
 */
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Register event listeners BEFORE connecting
    mongoose.connection.on("connected", () =>
      console.log("Mongoose connected to DB")
    );
    mongoose.connection.on("error", (err) =>
      console.error("Mongoose connection error:", err)
    );
    mongoose.connection.on("disconnected", () =>
      console.warn("Mongoose disconnected from DB")
    );

    const dbUrl = process.env.DB_URL || process.env.MONGO_URI;
    if (!dbUrl) {
      throw new Error("Database URL (DB_URL or MONGO_URI) is not defined in environment variables.");
    }
    await mongoose.connect(dbUrl);
  } catch (err) {
    console.error("DB connection refused:", err);
    process.exit(1);
  }
};

export default connectDB;
