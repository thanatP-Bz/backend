import { Router } from "express";
import {
  registerController,
  loginController,
  forgetPasswordController,
  resetPasswordController,
} from "../controllers/authController";

const router = Router();

router.post("/register", registerController);

router.post("/login", loginController);

router.post("/forget-password", forgetPasswordController);

router.post("/reset-password/:token", resetPasswordController);

export default router;
