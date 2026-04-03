import { Router } from "express";
import {
  register,
  login,
  refreshAccessToken,
  logout,
} from "../controllers/authController";
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

// Refresh token route
router.post("/refresh", refreshAccessToken);

// Logout route
router.post("/logout", logout);

export default router;
