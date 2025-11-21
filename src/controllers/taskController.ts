import { Request, Response } from "express";
import { Task } from "../models/taskModel";
import { asyncHandler } from "../utils/asyncHandler";

const createTask = asyncHandler(async (req: Request, res: Response) => {
  const { title, description } = req.body;

  const task = await Task.create({
    title,
    description,
    user: req.user!._id,
  });

  res.status(201).json(task);
});

const getTask = async (req: Request, res: Response) => {
  res.send("get task");
};

const getTaskById = async (req: Request, res: Response) => {
  res.send("get task by Id");
};
const updateTask = async (req: Request, res: Response) => {
  res.send("update task");
};

const deleteTask = async (req: Request, res: Response) => {
  res.send("delete task");
};

export { createTask, getTask, getTaskById, updateTask, deleteTask };
