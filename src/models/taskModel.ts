import mongoose, { Schema } from "mongoose";
import { ITask } from "../types/task";

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    description: { type: String, required: false },
    isCompleted: { type: Boolean, default: false },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

export const Task = mongoose.model<ITask>("task", taskSchema);
