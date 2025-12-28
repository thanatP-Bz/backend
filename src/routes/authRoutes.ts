import { Router } from "express";
import {
  registerController,
  loginController,
  forgetPasswordController,
  resetPasswordController,
  refreshTokenController,
} from "../controllers/authController";

const router = Router();

router.post("/register", registerController);

router.post("/login", loginController);

router.post("/forget-password", forgetPasswordController);

router.post("/reset-password/:token", resetPasswordController);

router.post("/refresh-token", refreshTokenController);

export default router;
