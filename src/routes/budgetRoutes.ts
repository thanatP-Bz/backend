import express from "express";
import {
  createBudget,
  getBudget,
  updateBudget,
  deleteBudget,
} from "../controllers/budgetController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", authenticateToken, createBudget);
router.get("/", authenticateToken, getBudget);
router.patch("/:id", authenticateToken, updateBudget);
router.delete("/:id", authenticateToken, deleteBudget);

export default router;

console.log("Budget routes loaded");
