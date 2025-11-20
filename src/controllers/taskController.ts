import { Request, Response } from "express";

const createTask = async (req: Request, res: Request) => {
  console.log("create task");
};

const getTask = async (req: Request, res: Request) => {
  console.log("get task");
};

const getTaskById = async (req: Request, res: Request) => {
  console.log("get task by Id");
};
const updateTask = async (req: Request, res: Request) => {
  console.log("update task");
};

const deleteTask = async (req: Request, res: Request) => {
  console.log("delete task");
};

export { createTask, getTask, getTaskById, updateTask, deleteTask };
