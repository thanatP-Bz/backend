import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);
import express, { Application, Request, Response } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import { errorHandler, notFound } from "./middleware/errorHandler";

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Application = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || process.env.LOCAL_HOST,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};

connectDB();

// Auth Routes
app.use("/api/auth", authRoutes);
//transaction Routes
app.use("/api/transactions", transactionRoutes);

// Test Route
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Financial Tracker API is running! 🚀" });
});

// Error handling (must be last)
app.use(notFound);
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
