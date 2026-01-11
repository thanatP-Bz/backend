import { Session } from "../models/sessionModel";
import { Types } from "mongoose";
import { ISessionDocument } from "../types/session";

interface CreateSessionInput {
  userId: string | Types.ObjectId;
  ipAddress: string;
  userAgent: string;
}

//Create a new session when user log in
export const createSession = async (
  input: CreateSessionInput
): Promise<ISessionDocument> => {
  const { userId, ipAddress, userAgent } = input;

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const session = await Session.create({
    userId: new Types.ObjectId(userId),
    loginTime: new Date(),
    lastActivity: new Date(),
    expiresAt,
    ipAddress,
    userAgent,
    isActive: true,
  });
  console.log("Session created:", session._id);
  return session;
};

//Update session activity (called on every request)
export const updateSessionActivity = async (
  sessionId: string
): Promise<void> => {
  await Session.findByIdAndUpdate(sessionId, {
    lastActivity: new Date(),
  });
};

//Deactivate session(log out)
export const deactivateSession = async (sessionId: string): Promise<void> => {
  await Session.findByIdAndUpdate(sessionId, {
    isActive: false,
  });
  console.log("session deactivated:", sessionId);
};

//check if session is valid
export const isSessionValid = async (sessionId: string): Promise<boolean> => {
  const session = await Session.findById(sessionId);

  if (!session) {
    return false;
  }

  if (!session.isActive || session.expiresAt < new Date()) {
    return false;
  }

  return true;
};

//clean up expired session
export const cleanupExpiredSession = async (): Promise<void> => {
  const result = await Session.deleteMany({
    expiresAt: { $lt: new Date() },
  });
  console.log(`clean up ${result.deletedCount} expired sessions`);
};

//get all active session for a user
export const getUserActiveSessions = async (
  userId: string
): Promise<ISessionDocument[]> => {
  return await Session.find({
    userId: new Types.ObjectId(userId),
    isActive: true,
    expiresAt: { $gt: new Date() },
  }).sort({ loginTime: -1 });
};
