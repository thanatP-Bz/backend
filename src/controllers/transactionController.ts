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

// Get single transaction by ID
export const getTransactionById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    // Find transaction by ID and ensure it belongs to this user
    const transaction = await Transaction.findOne({
      _id: id,
      userId: req.userId,
    });

    // If transaction not found or doesn't belong to user
    if (!transaction) {
      res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      transaction,
    });
  },
);

// Update transaction
export const updateTransaction = asyncHandler(
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

    const { id } = req.params;
    const { type, amount, category, description, date } = req.body;

    // Find transaction by ID and ensure it belongs to this user
    const transaction = await Transaction.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!transaction) {
      res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
      return;
    }

    // Update only the fields that were provided
    if (type !== undefined) transaction.type = type;
    if (amount !== undefined) transaction.amount = amount;
    if (category !== undefined) transaction.category = category;
    if (description !== undefined) transaction.description = description;
    if (date !== undefined) transaction.date = date;

    // Save updated transaction
    await transaction.save();

    res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      transaction,
    });
  },
);

// Delete transaction
export const deleteTransaction = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    // Find and delete transaction (only if it belongs to this user)
    const transaction = await Transaction.findOneAndDelete({
      _id: id,
      userId: req.userId,
    });

    if (!transaction) {
      res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
    });
  },
);
