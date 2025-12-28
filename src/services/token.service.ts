import { User } from "../models/authModel";
import { IUser } from "../types/user";
import { ApiError } from "../utils/ApiError";
import {
  verifyRefreshToken,
  generateRefreshToken,
} from "../utils/generateToken";
import { JwtPayload } from "jsonwebtoken";

export const refreshToken = async (data: IUser) => {
  const { refreshToken } = data;

  if (!refreshToken) throw new ApiError("Refresh Token Required", 401);

  const decoded = verifyRefreshToken(refreshToken) as JwtPayload;

  if (!decoded) throw new ApiError("Invalid refresh Token", 401);

  const user = await User.findOne({
    _id: decoded.userId,
    refreshToken: refreshToken,
    refreshTokenExpiry: { $gt: Date.now() },
  });
  if (!user) throw new ApiError("Invalid refresh token", 401);

  const newAccessToken = generateRefreshToken(user._id.toString());

  return {
    accessToken: newAccessToken,
  };
};
