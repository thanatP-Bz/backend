import { Request, Response } from "express";
import { asyncHandler } from "../utils/AsyncHandler";
import Budget from "../models/Budget";

// Create budget
export const createBudget = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { month, year, totalLimit, categories } = req.body;

    const existingBudget = await Budget.findOne({
      userId: req.userId,
      month,
      year,
    });
    if (existingBudget) {
      res.status(400).json({
        success: false,
        message: "Budget already exists for this month",
      });
      return;
    }

    const budget = new Budget({
      userId: req.userId,
      month,
      year,
      totalLimit,
      categories,
    });

    await budget.save();

    res
      .status(201)
      .json({ success: true, budget, message: "Budget has been added" });
  },
);

// Get budget by month and year
export const getBudget = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { month, year } = req.query;

    const budget = await Budget.findOne({
      userId: req.userId,
      month,
      year,
    });

    if (!budget) {
      res.status(404).json({
        success: false,
        message: "Budget not found",
      });
      return;
    }

    res.status(200).json({ success: true, budget });
  },
);

// Update budget
export const updateBudget = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { month, year, totalLimit, categories } = req.body;

    //check budget exist
    const budget = await Budget.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!budget) {
      res.status(404).json({
        success: false,
        message: "Budget not found",
      });
      return;
    }

    // Update only the fields that were provided
    if (month !== undefined) budget.month = month;
    if (year !== undefined) budget.year = year;
    if (totalLimit !== undefined) budget.totalLimit = totalLimit;
    if (categories !== undefined) budget.categories = categories;

    await budget.save();

    res.status(200).json({ success: true, budget, message: "Budget updated" });
  },
);

// Delete budget
export const deleteBudget = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    //check budget exist
    const budget = await Budget.findOneAndDelete({
      _id: id,
      userId: req.userId,
    });

    if (!budget) {
      res.status(404).json({
        success: false,
        message: "Budget not found",
      });
      return;
    }

    res.status(200).json({ success: true, message: "Budget deleted" });
  },
);
