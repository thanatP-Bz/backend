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
import { rateLimiter } from "../middleware/rateLimiter";

const router = Router();

// Registration
router.post("/register", rateLimiter("register"), registerController);
// Login
router.post("/login", rateLimiter("login"), loginController);
// verify 2FA login
router.post(
  "/verify-2fa-login",
  rateLimiter("verify2FA"),
  verify2FALoginController,
);
//change password
router.post(
  "/forget-password",
  rateLimiter("forgetPassword"),
  forgetPasswordController,
);

// Email Verification
router.get("/verify-email", verifyEmailController);

// Resend Verification
router.post("/resend-verification", resendVerifyEmailController);

// Password
router.patch("/change-password", requireAuth, changePasswordController);
router.post("/reset-password/:token", resetPasswordController);

// Refresh Token
router.post("/refresh-token", refreshTokenController);

//log out
router.post("/logout", requireAuth, logoutController);

export default router;
