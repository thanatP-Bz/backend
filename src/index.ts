import express, { Request, Response } from "express";
import env from "dotenv";
import cors from "cors";
import connectDB from "./config/connectDB";
env.config();

const app = express();

app.use(cors());

//middleware
app.use(express.json());

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
