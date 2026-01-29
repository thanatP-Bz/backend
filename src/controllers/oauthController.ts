// backend/src/controllers/oauthController.ts
import { Request, Response } from "express";
import { handleGoogleCallback } from "../services/oauth.service";
import { IUserDocument } from "../types/user";
import { createSession } from "../services/session.service";

// backend/src/controllers/oauthController.ts

export const googleCallbackController = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUserDocument;

    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_user`);
    }

    const { accessToken, refreshToken } = await handleGoogleCallback(user);

    const session = await createSession({
      userId: user._id.toString(),
      ipAddress: req.ip || req.socket.remoteAddress || "unknown",
      userAgent: req.headers["user-agent"] || "unknown",
    });

    // ✅ Create a TEMPORARY token that frontend can exchange for real cookies
    const tempToken = Buffer.from(
      JSON.stringify({
        accessToken,
        refreshToken,
        sessionId: session._id.toString(),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          isVerified: user.isVerified,
          twoFactorEnabled: user.twoFactorEnabled,
          authProvider: user.authProvider,
          profilePicture: user.profilePicture,
          hasPassword: !!user.password,
        },
      }),
    ).toString("base64");

    // Redirect with temp token
    res.redirect(
      `${process.env.FRONTEND_URL}/oauth/callback?token=${tempToken}`,
    );
  } catch (error) {
    res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
  }
};

export const exchangeTokenController = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token required" });
    }

    // Decode temp token
    const data = JSON.parse(Buffer.from(token, "base64").toString());

    // Set cookies
    res.cookie("accessToken", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.cookie("refreshToken", data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.cookie("sessionId", data.sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.json({ user: data.user });
  } catch (error) {
    res.status(400).json({ message: "Invalid token" });
  }
};
