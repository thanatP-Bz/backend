import { Request, Response } from "express";
import { Task } from "../models/taskModel";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

const createTask = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, isCompleted } = req.body;

  const task = await Task.create({
    title,
    description,
    isCompleted,
    user: req.user!._id,
  });

  res.status(201).json({ message: "Create Task Successfully!", task });
});

const getTask = async (req: Request, res: Response) => {
  const tasks = await Task.find({ user: req.user!._id });

  res.status(200).json(tasks);
};

const getTaskById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const task = await Task.findById(id);

  res.status(200).json({ task });
};
const updateTask = async (req: Request, res: Response) => {
  const { id } = req.params;

  const task = await Task.findOne({ _id: id, user: req.user!.id });

  if (!task) throw new ApiError("task not found", 400);

  const { title, description, isCompleted } = req.body;
  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (isCompleted !== undefined) task.isCompleted = isCompleted;

  const updateTask = await task.save();

  res.status(200).json({ message: "Update Task Successfully!", updateTask });
};

const deleteTask = async (req: Request, res: Response) => {
  const { id } = req.params;

  const task = await Task.findById(id);

  if (!task) {
    throw new ApiError("Task not found", 404);
  }
  /* if (task.user.toString() !== req.user!._id.toString()) {
    throw new ApiError("Not authorized", 403);
  } */
  if (!task.user.equals(req.user!._id)) {
    throw new ApiError("Not authorized", 403);
  }

  await task.deleteOne();

  res.status(200).json({ message: "Task deleted successfully" });
};

export { createTask, getTask, getTaskById, updateTask, deleteTask };
