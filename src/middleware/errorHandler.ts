import { Request, Response, NextFunction } from "express";

export const errHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err.stack);

  const stateCode = err.statusCode || 500;
  const message = err.message || "Something went wrong";

  res.status(stateCode).json({ success: false, message });
};
