import { Router } from "express";
import { register, login } from "../controllers/authController";
import {
  registerValidation,
  loginValidation,
} from "../validators/authValidators";
import { authLimiter } from "../middleware/rateLimiter";

const router = Router();

// Register route
router.post("/register", authLimiter, registerValidation, register);

// Login route
router.post("/login", authLimiter, loginValidation, login);

export default router;
