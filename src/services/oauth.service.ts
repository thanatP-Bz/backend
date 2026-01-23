// backend/src/services/oauth.service.ts
import { IUserDocument } from "../types/user";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken";

export const handleGoogleCallback = async (user: IUserDocument) => {
  // Generate tokens
  const accessToken = generateAccessToken(user._id.toString());
  const refreshToken = generateRefreshToken(user._id.toString());

  // Save refresh token to database
  user.refreshToken = refreshToken;
  user.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await user.save();

  return { accessToken, refreshToken };
};
