import mongoose from "mongoose";

export interface ITask {
  title: string;
  description?: string;
  isCompleted: boolean;
  user: mongoose.Types.ObjectId;
}
