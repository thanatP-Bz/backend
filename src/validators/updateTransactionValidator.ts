import { body } from "express-validator";

export const updateTransactionValidation = [
  body("type")
    .optional()
    .isIn(["income", "expense"])
    .withMessage("Type must be income or expense"),

  body("amount")
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be greater than 0"),

  body("category")
    .optional()
    .isIn(["Food", "Transport", "Housing", "Entertainment", "Salary", "Other"])
    .withMessage("Invalid category"),

  body("date").optional().isISO8601().withMessage("Invalid date format"),

  body("description").optional().trim(),
];
