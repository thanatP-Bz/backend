import { User } from "../models/authModel";
import { IUser } from "../types/user";
import { ApiError } from "../utils/ApiError";
import {
  verifyRefreshToken,
  generateAccessToken,
} from "../utils/generateToken";
import { JwtPayload } from "jsonwebtoken";

export const refreshToken = async (data: IUser) => {
  const { refreshToken } = data;

  if (!refreshToken) throw new ApiError("Refresh Token Required", 401);

  const decoded = verifyRefreshToken(refreshToken) as JwtPayload;
  console.log("Token decoded:", decoded);

  if (!decoded) {
    console.log("❌ Token verification failed");
    throw new ApiError("Invalid refresh Token", 401);
  }

  console.log("\nSearching for user:");
  console.log("  _id:", decoded._id);
  console.log("  refreshToken match:", refreshToken.substring(0, 50) + "...");
  console.log("  expiry must be >", new Date(Date.now()));

  // First, check if user exists
  const userExists = await User.findById(decoded._id);
  const user = await User.findOne({
    _id: decoded._id,
    refreshToken: refreshToken,
    refreshTokenExpiry: { $gt: Date.now() },
  });

  if (!user) throw new ApiError("Invalid refresh token", 401);

  const newAccessToken = generateAccessToken(user._id.toString());

  return {
    accessToken: newAccessToken,
  };
};
