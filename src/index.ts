import env from "dotenv";
env.config();
import express, { Request, Response } from "express";
import connectDB from "./config/connectDB";
import authRoutes from "./routes/authRoutes";
import taskRoutes from "./routes/taskRoutes";
import oauthRoutes from "./routes/oauthRoutes";
import twoFactorRoutes from "./routes/2FARoutes";
import { errHandler } from "./middleware/errorHandler";
import cookieParser from "cookie-parser";
import passport from "./config/passport";

const app = express();

// ===== CORS - Manual headers ONLY (remove cors() package) =====
const allowedOrigins = [
  "http://localhost:5173", // Local development
  "https://mern-auth-frontend-rozs.onrender.com", // Production
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,PATCH,OPTIONS",
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type,Authorization,X-Session-Id", // ✅ Add X-Session-Id
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// ===== Middleware =====
app.use(cookieParser());
app.use(express.json());

app.use(passport.initialize());

// ===== Routes =====
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/task", taskRoutes);
app.use("/api/2fa", twoFactorRoutes);
app.use("/api/oauth", oauthRoutes); // ✅ Changed to /api/oauth

app.get("/", (req: Request, res: Response) => {
  res.send("hello world");
});

// ===== Error Handler (always last) =====
app.use(errHandler);

const PORT = process.env.PORT || 4004;
const MONGO_URI = process.env.MONGO_URI as string;

const serverStart = async () => {
  await connectDB(MONGO_URI);
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  });
};

serverStart();
