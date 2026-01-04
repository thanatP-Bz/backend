import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { login, register } from "../services/auth.service";
import {
  forgetPassword,
  resetPassword,
} from "../services/passwordReset.service";
import { refreshToken } from "../services/token.service";
import {
  resendVerificationEmail,
  verifyEmail,
} from "../services/verifyEmail.service";

//**************Register***************//
export const registerController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await register(req.body);

    res.status(200).json(result);
  }
);

//**************verify Email***************//
export const verifyEmailController = asyncHandler(
  async (req: Request, res: Response) => {
    const { token } = req.query;

    console.log(token);

    if (!token || typeof token !== "string") {
      throw new ApiError("Verification token is required", 400);
    }

    const result = await verifyEmail(token);

    res.status(200).json(result);
  }
);

//**************resend verify Email***************//
export const resendVerifyEmailController = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) throw new ApiError("Email is required", 400);
    const result = await resendVerificationEmail(email);
    res.status(200).json(result);
  }
);

//**************Login***************//
export const loginController = asyncHandler(
  async (req: Request, res: Response) => {
    console.log("📨 Login request received");
    const result = await login(req.body);
    console.log("✅ Login successful, sending response");
    res.status(200).json(result);
  }
);

//**************Forget Password***************//
export const forgetPasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) throw new ApiError("Email is required", 400);
    const result = await forgetPassword(email);
    res.status(200).json(result);
  }
);

//**************Reset Password***************//
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

//**************Refresh Token***************//
export const refreshTokenController = asyncHandler(
  async (req: Request, res: Response) => {
    console.log("📨 Refresh token request received");
    const result = await refreshToken(req.body);
    console.log("✅ Refresh successful, sending response");
    res.status(200).json(result);
  }
);
