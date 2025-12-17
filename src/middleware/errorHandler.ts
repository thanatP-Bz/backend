import { Request, Response, NextFunction } from "express";

export const errHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const stateCode = err.statusCode || 500;
  const message = err.message || "Something went wrong";

  res.status(stateCode).json({ status: false, message });
};
