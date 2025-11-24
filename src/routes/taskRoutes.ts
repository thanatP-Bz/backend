import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import {
  createTask,
  getTask,
  getTaskById,
  updateTask,
  deleteTask,
} from "../controllers/taskController";

const router = Router();
router.use(requireAuth);

router.post("/", createTask);
router.get("/", getTask);
router.get("/:id", getTaskById);
router.patch("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
