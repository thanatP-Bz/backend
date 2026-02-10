import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "../models/authModel";
import { ApiError } from "../utils/ApiError";
import {
  isSessionValid,
  updateSessionActivity,
} from "../services/session.redis.service";

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // ✅ Check Authorization header first, then cookies
  const authHeader = req.headers.authorization;

  let token: string | undefined;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7); // Remove "Bearer " prefix
  } else {
    token = req.cookies.accessToken; // Fallback to cookies
  }

  // ✅ Get sessionId from header or cookie
  let sessionId: string | undefined;

  if (req.headers["x-session-id"]) {
    sessionId = req.headers["x-session-id"] as string;
  } else {
    sessionId = req.cookies.sessionId;
  }

  if (!token) {
    throw new ApiError("Token missing", 401);
  }

  if (!sessionId) {
    throw new ApiError("Session is missing", 401);
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET!,
    ) as JwtPayload;

    if (!decoded._id) {
      throw new ApiError("Invalid token payload", 401);
    }

    // Check session valid
    const sessionValid = await isSessionValid(sessionId);

    if (!sessionValid) {
      throw new ApiError("Session expired, please login again", 401);
    }

    const user = await User.findById(decoded._id).select("_id name email");

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    // Update session activity
    await updateSessionActivity(sessionId);

    req.user = user;
    next();
  } catch (error: any) {
    throw new ApiError("Request is not authorized", 401);
  }
};
