import { body } from "express-validator";

export const registerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),

  body("email")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

export const loginValidation = [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),
];
