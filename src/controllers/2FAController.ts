import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import {
  enabled2FA,
  disable2FA,
  verify2FASetup,
  regenerateBackupCodes,
} from "../services/2FA.service";

import { ApiError } from "../utils/ApiError";
import { IUserDocument } from "../types/user";
import { User } from "../models/authModel";

//enable 2FA
export const enable2FAController = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as IUserDocument;
    const email = user?.email;

    if (!email) {
      throw new ApiError("Unauthorized", 401);
    }

    const result = await enabled2FA(email);
    return res.status(200).json(result);
  },
);

//verify 2FA
export const verify2FASetupController = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as IUserDocument;
    const email = user?.email;
    const { token } = req.body;

    if (!email) {
      throw new ApiError("Unauthorized", 401);
    }

    if (user.authProvider === "google") {
      throw new ApiError("Cannot enable 2FA. You signed in with Google.", 400);
    }

    if (!token) {
      throw new ApiError("token is required");
    }

    const result = await verify2FASetup(email, token);

    return res.status(200).json(result);
  },
);

//disable2FA
export const disable2FAController = asyncHandler(
  async (req: Request, res: Response) => {
    const authUser = req.user as { email?: string };

    if (!authUser?.email) {
      throw new ApiError("Unauthorized", 401);
    }

    // 🔥 Fetch full user from DB
    const user = await User.findOne({ email: authUser.email });

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    console.log("🔍 User authProvider:", user.authProvider);

    if (user.authProvider === "google") {
      const result = await disable2FA(user.email, null);
      return res.status(200).json(result);
    }

    const { password } = req.body;

    if (!password) {
      throw new ApiError("Password is required", 401);
    }

    const result = await disable2FA(user.email, password);
    return res.status(200).json(result);
  },
);

//regenrate backup codes
export const regenerateBackendCodesController = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as IUserDocument;
    const email = user?.email;

    if (!email) {
      throw new ApiError("Unathorized", 401);
    }

    const result = await regenerateBackupCodes(email);
    return res.status(200).json(result);
  },
);
