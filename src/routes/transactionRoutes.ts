import { Router } from "express";
import {
  createTransaction,
  deleteTransaction,
  getTransactionById,
  getTransactions,
  updateTransaction,
} from "../controllers/transactionController";
import { createTransactionValidation } from "../validators/tranSactionValidators";
import { authenticateToken } from "../middleware/authMiddleware";
import { updateTransactionValidation } from "../validators/updateTransactionValidator";

const router = Router();

// Protect all transaction routes
router.use(authenticateToken);

// Create transaction
router.post("/", createTransactionValidation, createTransaction);

//get transaction
router.get("/", getTransactions);

// Get single transaction by ID
router.get("/:id", getTransactionById);

// Update transaction
router.patch("/:id", updateTransactionValidation, updateTransaction);

// delete transaction
router.delete("/:id", deleteTransaction);

export default router;
