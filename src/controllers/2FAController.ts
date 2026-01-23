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

//enable 2FA
export const enable2FAController = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as IUserDocument;
    const email = user?.email;

    if (!email) {
      throw new ApiError("Unathorized", 401);
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
    const user = req.user as IUserDocument;
    const email = user?.email;
    const { password } = req.body;

    if (!email) {
      throw new ApiError("Unauthorized", 401);
    }

    if (!password) {
      throw new ApiError("Password is required", 401);
    }

    const result = await disable2FA(email, password);
    return res.status(200).json(result);
  },
);

//regenrate backup codes
export const regenerateBackendCodesController = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as IUserDocument;
    const email = user?.email;

    if (!email) {
      throw new ApiError("Unthorized", 401);
    }

    const result = await regenerateBackupCodes(email);
    return res.status(200).json(result);
  },
);
