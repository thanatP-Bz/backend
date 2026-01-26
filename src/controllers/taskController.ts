import { Request, Response } from "express";
import { Task } from "../models/taskModel";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import mongoose from "mongoose";
import { IUserDocument } from "../types/user";

const createTask = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, isCompleted } = req.body;
  const user = req.user as IUserDocument;

  const task = await Task.create({
    title,
    description,
    isCompleted: isCompleted,
    user: user!._id,
  });

  res.status(201).json(task);
});

// ✅ Added asyncHandler
const getTask = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as IUserDocument;
  const tasks = await Task.find({ user: user!._id });

  res.status(200).json(tasks);
});

// ✅ Added asyncHandler
const getTaskById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const task = await Task.findById(id);

  res.status(200).json(task);
});

// ✅ Added asyncHandler
const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user as IUserDocument;

  const task = await Task.findOne({ _id: id, user: user!._id }); // ✅ Fixed: user!.id → user!._id

  if (!task) throw new ApiError("task not found", 400);

  const { title, description, isCompleted } = req.body;
  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (isCompleted !== undefined) task.isCompleted = isCompleted;

  const updatedTask = await task.save(); // ✅ Fixed variable name

  res.status(200).json(updatedTask);
});

// ✅ Added asyncHandler
const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id as string)) {
    throw new ApiError("task not found", 404);
  }

  const task = await Task.findOneAndDelete({ _id: id });
  if (!task) {
    throw new ApiError("task not found", 400);
  }

  res.status(200).json(task);
});

export { createTask, getTask, getTaskById, updateTask, deleteTask };
