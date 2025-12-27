import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { login, register } from "../services/auth.service";
import {
  forgetPassword,
  resetPassword,
} from "../services/passwordReset.service";

//**************Register and Login***************//

export const registerController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await register(req.body);

    res.status(200).json(result);
  }
);

export const loginController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await login(req.body);

    res.status(200).json(result);
  }
);

//**************Forget and Reset Password***************//

export const forgetPasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await forgetPassword(req.body.email);
    res.status(200).json(result);
  }
);

export const resetPasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) {
      throw new ApiError("Token and password are required", 400);
    }
    const result = await resetPassword(token, password);
    res.status(200).json(result);
  }
);
