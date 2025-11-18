import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface jwtPayload {
  id: string;
  email: string;
}
