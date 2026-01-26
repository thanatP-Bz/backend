"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Registration
router.post("/register", authController_1.registerController);
// Login
router.post("/login", authController_1.loginController);
// verify 2FA login
router.post("/verify-2fa-login", authController_1.verify2FALoginController);
// Email Verification
router.get("/verify-email", authController_1.verifyEmailController);
// Resend Verification
router.post("/resend-verification", authController_1.resendVerifyEmailController);
// Password
router.patch("/change-password", authMiddleware_1.requireAuth, authController_1.changePasswordController);
router.post("/forget-password", authController_1.forgetPasswordController);
router.post("/reset-password/:token", authController_1.resetPasswordController);
// Refresh Token
router.post("/refresh-token", authController_1.refreshTokenController);
//log out
router.post("/logout", authMiddleware_1.requireAuth, authController_1.logoutController);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map