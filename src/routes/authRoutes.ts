import { Router } from "express";
import {
  registerUser,
  loginUser,
  forgetPassword,
  resetPassword,
} from "../controllers/authController";

const router = Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/forget-password", forgetPassword);

router.post("/reset-password/:token", resetPassword);

export default router;
