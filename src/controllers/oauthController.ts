// backend/src/controllers/oauthController.ts
import { Request, Response } from "express";
import { handleGoogleCallback } from "../services/oauth.service";
import { IUserDocument } from "../types/user";

export const googleCallbackController = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUserDocument;

    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_user`);
    }

    const { accessToken, refreshToken } = await handleGoogleCallback(user);

    // Redirect to frontend with tokens
    res.redirect(
      `${process.env.FRONTEND_URL}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`,
    );
  } catch (error) {
    console.error("OAuth callback error:", error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
  }
};
