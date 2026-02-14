import { Request, Response, NextFunction } from "express";

export const errHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong";

  console.log("🔍 Error handler:");
  console.log("statusCode:", statusCode);
  console.log("message:", message);
  console.log("req.rateLimit:", req.rateLimit);

  // Add rate limit info if available
  const remaining = req.rateLimit?.remaining;
  const limit = req.rateLimit?.limit;

  const isAuthError = statusCode === 400 || statusCode === 401;

  const rateLimitMessage =
    remaining !== undefined && isAuthError
      ? `${message} ${remaining} of ${limit} attempts remaining.`
      : message;

  res.status(statusCode).json({ status: false, message: rateLimitMessage });
};
