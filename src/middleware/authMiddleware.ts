import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "../models/authModel";
import { IUser } from "../models/type";
import { ApiError } from "../utils/ApiError";

declare global {
  namespace Express {
    interface Request {
      user?: IUser | null;
    }
  }
}

export {};

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw new ApiError("Authorization token required", 401);
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    throw new ApiError("Token missing", 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    if (!decoded._id) {
      throw new ApiError("Invalid token payload", 401);
    }

    const user = await User.findById(decoded._id).select("_id name email");

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    req.user = user; // attach user
    next(); // ⚠️ important
  } catch (error) {
    throw new ApiError("Request is not authorized", 401);
  }
};
