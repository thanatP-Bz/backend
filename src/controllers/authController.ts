import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { login, logout, register } from "../services/auth.service";
import {
  forgetPassword,
  resetPassword,
} from "../services/passwordReset.service";
import { refreshToken } from "../services/token.service";
import {
  resendVerificationEmail,
  verifyEmail,
} from "../services/verifyEmail.service";
import { access } from "fs";

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

//**************Login***************//
export const loginController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await login(req.body);

    res.cookie("refreshToken", result.refreshToken),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      };

    res.status(200).json({
      message: result.message,
      accessToken: result.accessToken,
      user: result.user,
    });
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
    const token = req.cookies.refreshToken;

    if (!token) {
      throw new ApiError("Refresh token not found", 401);
    }
    const result = await refreshToken(token);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: "Token refreshed successfully",
      accessToken: result.accessToken,
    });
  }
);

//**************logout***************//
export const logoutController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id || req.body.userId;

    const result = await logout(userId);

    // ✅ Clear the cookie!
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json(result);
  }
);
