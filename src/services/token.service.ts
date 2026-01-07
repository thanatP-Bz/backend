import { User } from "../models/authModel";
import { ApiError } from "../utils/ApiError";
import {
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken";
import { JwtPayload } from "jsonwebtoken";

export const refreshToken = async (refreshToken: string) => {
  if (!refreshToken) throw new ApiError("Refresh Token Required", 401);

  const decoded = verifyRefreshToken(refreshToken) as JwtPayload;

  if (!decoded) {
    throw new ApiError("Invalid refresh Token", 401);
  }

  // First, check if user exists
  const userExists = await User.findById(decoded._id);
  if (!userExists) throw new ApiError("User Not Found", 404);

  const user = await User.findOne({
    _id: decoded._id,
    refreshToken: refreshToken,
    refreshTokenExpiry: { $gt: Date.now() },
  });

  if (!user) throw new ApiError("Invalid refresh token", 401);

  const newAccessToken = generateAccessToken(user._id.toString());
  const newRefreshToken = generateRefreshToken(user._id.toString());

  user.refreshToken = newRefreshToken;
  user.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await user.save();

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};
