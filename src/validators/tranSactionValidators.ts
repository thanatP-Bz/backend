import { body } from "express-validator";

export const createTransactionValidation = [
  body("type")
    .isIn(["income", "expense"])
    .withMessage("Type must be income or expense"),

  body("amount")
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be greater than 0"),

  body("category")
    .isIn(["Food", "Transport", "Housing", "Entertainment", "Salary", "Other"])
    .withMessage("Invalid category"),

  body("date").isISO8601().withMessage("Invalid date format"),

  body("description").optional().trim(),
];
