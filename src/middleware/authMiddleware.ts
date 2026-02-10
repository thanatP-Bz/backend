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
  console.log("\n🔍 === AUTH MIDDLEWARE DEBUG ===");

  // ✅ Check Authorization header first, then cookies
  const authHeader = req.headers.authorization;
  console.log("1. Authorization header:", authHeader ? "EXISTS" : "MISSING");

  let token: string | undefined;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7); // Remove "Bearer " prefix
    console.log(
      "2. Token from Authorization header:",
      token?.substring(0, 20) + "...",
    );
  } else {
    token = req.cookies.accessToken; // Fallback to cookies
    console.log(
      "2. Token from cookie:",
      token ? token.substring(0, 20) + "..." : "MISSING",
    );
  }

  // ✅ Get sessionId from header or cookie
  let sessionId: string | undefined;

  if (req.headers["x-session-id"]) {
    sessionId = req.headers["x-session-id"] as string;
    console.log("3. SessionId from header:", sessionId);
  } else {
    sessionId = req.cookies.sessionId;
    console.log("3. SessionId from cookie:", sessionId || "MISSING");
  }

  console.log("4. All cookies:", req.cookies);
  console.log("5. All headers:", req.headers);

  if (!token) {
    console.log("❌ FAILED: Token missing");
    throw new ApiError("Token missing", 401);
  }

  if (!sessionId) {
    console.log("❌ FAILED: Session missing");
    throw new ApiError("Session is missing", 401);
  }

  try {
    console.log("6. Verifying JWT...");
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET!,
    ) as JwtPayload;

    console.log("7. JWT decoded:", decoded);

    if (!decoded._id) {
      console.log("❌ No _id in decoded token");
      throw new ApiError("Invalid token payload", 401);
    }

    console.log("8. Checking if session is valid in Redis...");
    // Check session valid
    const sessionValid = await isSessionValid(sessionId);

    if (!sessionValid) {
      console.log("❌ Session expired or invalid");
      throw new ApiError("Session expired, please login again", 401);
    }

    console.log("9. Session is valid! Looking up user in MongoDB...");
    const user = await User.findById(decoded._id).select("_id name email");

    console.log("10. User found:", user ? user.email : "NOT FOUND");

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    console.log("11. Updating session activity in Redis...");
    // Update session activity
    await updateSessionActivity(sessionId);

    req.user = user;

    console.log("✅ Auth successful!");
    console.log("=== END AUTH MIDDLEWARE ===\n");
    next();
  } catch (error: any) {
    console.log("❌ Error in try-catch:", error.message);
    throw new ApiError("Request is not authorized", 401);
  }
};
