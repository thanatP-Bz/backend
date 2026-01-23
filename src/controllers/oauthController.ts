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

    // Encode user data
    const userData = encodeURIComponent(
      JSON.stringify({
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        authProvider: user.authProvider,
        profilePicture: user.profilePicture,
      }),
    );

    const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}&user=${userData}`;

    res.redirect(redirectUrl);
  } catch (error) {
    res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
  }
};
