import { Router } from "express";
import {
  createTransaction,
  getTransactions,
} from "../controllers/transactionController";
import { createTransactionValidation } from "../validators/tranSactionValidators";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

// Protect all transaction routes
router.use(authenticateToken);

// Create transaction
router.post("/", createTransactionValidation, createTransaction);

//get transaction
router.get("/", getTransactions);

export default router;
