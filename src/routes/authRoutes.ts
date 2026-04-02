import { Router } from "express";
import { register, login } from "../controllers/authController";
import {
  registerValidation,
  loginValidation,
} from "../validators/authValidators";

const router = Router();

// Register route
router.post("/register", registerValidation, register);

// Login route
router.post("/login", loginValidation, login);

export default router;
