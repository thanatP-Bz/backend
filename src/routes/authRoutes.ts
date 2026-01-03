import { Router } from "express";
import {
  registerController,
  loginController,
  forgetPasswordController,
  resetPasswordController,
  refreshTokenController,
  verifyEmailController,
  resendVerifyEmailController,
} from "../controllers/authController";

const router = Router();

// Registration
router.post("/register", registerController);

// Login
router.post("/login", loginController);

// Email Verification
router.get("/verify-email", verifyEmailController);

// Resend Verification
router.post("/resend-verification", resendVerifyEmailController);

// Password Reset
router.post("/forget-password", forgetPasswordController);
router.post("/reset-password", resetPasswordController);

// Refresh Token
router.post("/refresh-token", refreshTokenController);

export default router;
