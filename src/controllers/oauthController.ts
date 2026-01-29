// backend/src/controllers/oauthController.ts

import { Request, Response } from "express";
import { handleGoogleCallback } from "../services/oauth.service";
import { IUserDocument } from "../types/user";
import { createSession } from "../services/session.service";

export const googleCallbackController = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUserDocument;

    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_user`);
    }

    const { accessToken, refreshToken } = await handleGoogleCallback(user);

    // Create session for OAuth login
    const session = await createSession({
      userId: user._id.toString(),
      ipAddress: req.ip || req.socket.remoteAddress || "unknown",
      userAgent: req.headers["user-agent"] || "unknown",
    });

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
        hasPassword: !!user.password,
      }),
    );

    // ✅ Simple redirect with all data in URL
    const redirectUrl = `${process.env.FRONTEND_URL}/oauth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}&sessionId=${session._id.toString()}&user=${userData}`;

    res.redirect(redirectUrl);
  } catch (error) {
    res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
  }
};
