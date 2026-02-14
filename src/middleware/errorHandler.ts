import { Request, Response, NextFunction } from "express";

export const errHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong";

  // Add rate limit info if available
  const remaining = req.rateLimit?.remaining;
  const limit = req.rateLimit?.limit;

  const isAuthError = statusCode === 400 || statusCode === 401;

  const rateLimitMessage =
    remaining !== undefined && isAuthError
      ? remaining === 0
        ? `${message} This is your last attempt before being blocked!`
        : `${message} ${remaining} of ${limit} attempts remaining.`
      : message;

  res.status(statusCode).json({ status: false, message: rateLimitMessage });
};
