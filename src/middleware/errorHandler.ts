import { Request, Response, NextFunction } from "express";

// Custom Error class
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Global error handler
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // Log error for debugging
  console.error("❌ ERROR:", {
    message: err.message,
    statusCode: err.statusCode,
    stack: err.stack,
  });

  // Mongoose duplicate key error (email already exists)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    err.message = `${field} already exists`;
    err.statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e: any) => e.message);
    err.message = errors.join(", ");
    err.statusCode = 400;
  }

  // Mongoose cast error (invalid ID format)
  if (err.name === "CastError") {
    err.message = "Invalid ID format";
    err.statusCode = 400;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    err.message = "Invalid token";
    err.statusCode = 401;
  }

  if (err.name === "TokenExpiredError") {
    err.message = "Token expired";
    err.statusCode = 401;
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

// 404 Not Found handler
export const notFound = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};
