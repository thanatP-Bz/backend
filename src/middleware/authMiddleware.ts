import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "../models/authModel";
import { ApiError } from "../utils/ApiError";

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.accessToken;

  if (!token) {
    throw new ApiError("Token missing", 401);
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET!
    ) as JwtPayload;

    console.log("4. Decoded token:", decoded);

    if (!decoded._id) {
      console.log("❌ No _id in decoded token");
      throw new ApiError("Invalid token payload", 401);
    }

    console.log("5. Looking for user with _id:", decoded._id);

    const user = await User.findById(decoded._id).select("_id name email");

    console.log("6. User found:", user ? user.email : "NOT FOUND");

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    req.user = user;
    console.log("✅ Auth successful!");
    next();
  } catch (error: any) {
    console.log("❌ Error:", error.message);
    throw new ApiError("Request is not authorized", 401);
  }
};
