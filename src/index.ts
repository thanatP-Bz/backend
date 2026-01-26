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

//middleware
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "SESSION_SECRET",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // ✅ Updated for production
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // ✅ Updated
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  }),
);
app.use(express.json());

//add passport initialization
app.use(passport.initialize());

// ✅ Updated CORS for production
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

//router
app.use("/api/auth", authRoutes);
app.use("/api/task", taskRoutes);
app.use("/api/2fa", twoFactorRoutes);
app.use("/api/auth", oauthRoutes);

//errorHandler
app.use(errHandler);

app.get("/", (req: Request, res: Response) => {
  res.send("hello world");
});

const PORT = process.env.PORT || 4004;
const MONGO_URI = process.env.MONGO_URI as string;

const serverStart = async () => {
  await connectDB(MONGO_URI);

  app.listen(PORT, () => {
    console.log(`Listening to port ${PORT}`); // ✅ Fixed typo
  });

  console.log(process.env.PORT);
};

serverStart();
