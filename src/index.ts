import env from "dotenv";
env.config();
import express, { Request, Response } from "express";
import cors from "cors";
import connectDB from "./config/connectDB";
import authRoutes from "./routes/authRoutes";
import taskRoutes from "./routes/taskRoutes";
import { errHandler } from "./middleware/errorHandler";
import cookieParser from "cookie-parser";
import session from "express-session";

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
      secure: false,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

//router
app.use("/api/auth", authRoutes);
app.use("/api/task", taskRoutes);
//errorHanlder
app.use(errHandler);

app.get("/", (req: Request, res: Response) => {
  res.send("hello world");
});

const PORT = process.env.PORT || 4004;
const MONGO_URI = process.env.MONGO_URI as string;

const serverStart = async () => {
  await connectDB(MONGO_URI);

  app.listen(PORT, () => {
    console.log(`listenning to port ${PORT}`);
  });

  console.log(process.env.PORT);
};

serverStart();
