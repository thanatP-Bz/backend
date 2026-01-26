import env from "dotenv";
env.config();
import express, { Request, Response } from "express";
import cors from "cors";
import connectDB from "./config/connectDB";
import authRoutes from "./routes/authRoutes";
import taskRoutes from "./routes/taskRoutes";
import oauthRoutes from "./routes/oauthRoutes";
import twoFactorRoutes from "./routes/2FARoutes";
import { errHandler } from "./middleware/errorHandler";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "./config/passport";

const app = express();

// ✅ CORS configuration
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Set-Cookie"],
  maxAge: 86400, // Cache preflight for 24 hours
};

app.use(cors(corsOptions));

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "SESSION_SECRET",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  }),
);

// Passport initialization
app.use(passport.initialize());
/* app.use(passport.session()); */

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/task", taskRoutes);
app.use("/api/2fa", twoFactorRoutes);
app.use("/api/auth", oauthRoutes);

// Error handler (always last)
app.use(errHandler);

app.get("/", (req: Request, res: Response) => {
  res.send("hello world");
});

const PORT = process.env.PORT || 4004;
const MONGO_URI = process.env.MONGO_URI as string;

const serverStart = async () => {
  await connectDB(MONGO_URI);

  app.listen(PORT, () => {
    console.log(`Listening to port ${PORT}`);
  });
};

serverStart();
