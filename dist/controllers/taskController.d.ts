import { Request, Response } from "express";
declare const createTask: (req: Request, res: Response, next: import("express").NextFunction) => void;
declare const getTask: (req: Request, res: Response, next: import("express").NextFunction) => void;
declare const getTaskById: (req: Request, res: Response, next: import("express").NextFunction) => void;
declare const updateTask: (req: Request, res: Response, next: import("express").NextFunction) => void;
declare const deleteTask: (req: Request, res: Response, next: import("express").NextFunction) => void;
export { createTask, getTask, getTaskById, updateTask, deleteTask };
//# sourceMappingURL=taskController.d.ts.map