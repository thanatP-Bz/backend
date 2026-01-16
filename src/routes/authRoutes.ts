import { Router } from "express";
import {
  registerController,
  loginController,
  forgetPasswordController,
  resetPasswordController,
  refreshTokenController,
  verifyEmailController,
  resendVerifyEmailController,
  logoutController,
  changePasswordController,
  verify2FALoginController,
} from "../controllers/authController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

// Registration
router.post("/register", registerController);

// Login
router.post("/login", loginController);

// verify 2FA login
router.post("/verify-2fa-login", verify2FALoginController);

// Email Verification
router.get("/verify-email", verifyEmailController);

// Resend Verification
router.post("/resend-verification", resendVerifyEmailController);

// Password
router.patch("/change-password", requireAuth, changePasswordController);
router.post("/forget-password", forgetPasswordController);
router.post("/reset-password/:token", resetPasswordController);

// Refresh Token
router.post("/refresh-token", refreshTokenController);

//log out
router.post("/logout", logoutController);

export default router;
