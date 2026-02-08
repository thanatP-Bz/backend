import { Types } from "mongoose";

export interface SessionData {
  userId: string;
  ipAddress: string;
  userAgent: string;
  loginTime: string;
  lastActivity: string;
  isActive: boolean;
}

export interface CreateSessionInput {
  userId: string | Types.ObjectId;
  ipAddress: string;
  userAgent: string;
}
