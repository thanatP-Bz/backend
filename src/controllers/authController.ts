import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { login, register } from "../services/auth.service";
import {
  forgetPassword,
  resetPassword,
} from "../services/passwordReset.service";
import { refreshToken } from "../services/token.service";

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
    const { email } = req.body;

    if (!email) throw new ApiError("Email is required", 400);
    const result = await forgetPassword(email);
    res.status(200).json(result);
  }
);

export const resetPasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password)
      throw new ApiError("Token and password are required", 400);

    const result = await resetPassword(token, password);
    res.status(200).json(result);
  }
);

export const refreshTokenController = asyncHandler(
  async (req: Request, res: Response) => {
    const { token } = req.body;

    if (!token) throw new ApiError("invalid refresh token", 401);

    const result = await refreshToken(token);
    res.status(200).json(result);
  }
);
