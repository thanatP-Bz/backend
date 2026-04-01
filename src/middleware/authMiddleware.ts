import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
}

// Extend Express Request to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Get the token part after "Bearer "

    // Step 2: Check if token exists
    if (!token) {
      res.status(401).json({
        success: false,
        message: "No token provided, authorization denied",
      });
      return;
    }

    // Step 3: Verify token is valid
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as JwtPayload;

    // Step 4: Attach userId to request so controllers can use it
    req.userId = decoded.userId;

    // Step 5: Continue to next middleware/controller
    next();
  } catch (error: any) {
    // Token is invalid or expired
    if (error.name === "TokenExpiredError") {
      res.status(401).json({
        success: false,
        message: "Token expired, please login again",
      });
      return;
    }

    res.status(403).json({
      success: false,
      message: "Invalid token",
    });
  }
};
