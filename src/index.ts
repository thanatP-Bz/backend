import env from "dotenv";
env.config();
import express, { Request, Response } from "express";
import cors from "cors";
import connectDB from "./config/connectDB";
import authRoutes from "./routes/authRoutes";
import taskRoutes from "./routes/taskRoutes";
import { errHandler } from "./middleware/errorHandler";

const app = express();

app.use(cors());
//middleware
app.use(express.json());
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
