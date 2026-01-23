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

const getTask = async (req: Request, res: Response) => {
  const user = req.user as IUserDocument;
  const tasks = await Task.find({ user: user!._id });

  res.status(200).json(tasks);
};

const getTaskById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const task = await Task.findById(id);

  res.status(200).json(task);
};
const updateTask = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user as IUserDocument;

  const task = await Task.findOne({ _id: id, user: user!.id });

  if (!task) throw new ApiError("task not found", 400);

  const { title, description, isCompleted } = req.body;
  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (isCompleted !== undefined) task.isCompleted = isCompleted;

  const updateTask = await task.save();

  res.status(200).json(updateTask);
};

const deleteTask = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id as string)) {
    throw new ApiError("task not found", 404);
  }

  const task = await Task.findOneAndDelete({ _id: id });
  if (!task) {
    throw new ApiError("task not found", 400);
  }

  res.status(200).json(task);
};

export { createTask, getTask, getTaskById, updateTask, deleteTask };
