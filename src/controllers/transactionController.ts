import { Request, Response } from "express";
import { validationResult } from "express-validator";
import Transaction from "../models/Transaction";
import { asyncHandler } from "../utils/AsyncHandler";

// Create transaction
export const createTransaction = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array(),
      });
      return;
    }

    const { type, amount, category, description, date } = req.body;

    // Create new transaction
    const transaction = new Transaction({
      userId: req.userId, // From auth middleware
      type,
      amount,
      category,
      description,
      date,
    });

    await transaction.save();

    res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      transaction,
    });
  },
);

// Get all transactions (with optional filters)
export const getTransactions = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { type, category, startDate, endDate } = req.query;

    // Build filter object
    const filter: any = { userId: req.userId };

    // Add type filter if provided
    if (type) {
      filter.type = type;
    }

    // Add category filter if provided
    if (category) {
      filter.category = category;
    }

    // Add date range filter if provided
    if (startDate || endDate) {
      filter.date = {};

      if (startDate) {
        filter.date.$gte = new Date(startDate as string);
      }

      if (endDate) {
        filter.date.$lte = new Date(endDate as string);
      }
    }

    // Query database with filters, sort by date (newest first)
    const transactions = await Transaction.find(filter).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions,
    });
  },
);
