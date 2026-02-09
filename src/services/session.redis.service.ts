import { session } from "passport";
import redis from "../config/redis";
import { SessionData, CreateSessionInput } from "../types/redisSession";

//create sesion when user login
export const createSession = async (
  input: CreateSessionInput,
): Promise<string> => {
  const { userId, ipAddress, userAgent } = input;

  const sessionId = generateSessionId();
  const sessionKey = `session:${sessionId}`;

  const sessionData: SessionData = {
    userId: userId.toString(),
    ipAddress,
    userAgent,
    loginTime: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    isActive: true,
  };

  //Store in Redis
  const expirationSeconds = 7 * 24 * 60 * 60;
  await redis.setex(sessionKey, expirationSeconds, JSON.stringify(sessionData));

  console.log(" Session created in Redis:", sessionId);
  return sessionId;
};

//update session activity (every time user login)
export const updateSessionActivity = async (
  sessionId: string,
): Promise<void> => {
  const sesionKey = `session:${sessionId}`;

  //get exist session data
  const sessionDataString = await redis.get(sesionKey);

  if (!sessionDataString) {
    console.log("❌ Session not found:", sessionId);
    return;
  }

  const sessionData: SessionData = JSON.parse(sessionDataString);

  //update last activity
  sessionData.lastActivity = new Date().toISOString();

  //Get remain TTL
  const ttl = await redis.ttl(sesionKey);

  //Re-save with update data remaining TTl
  await redis.setex(sesionKey, ttl, JSON.stringify(sessionData));
};

//deactivate session(logout)
export const deactivateSession = async (sessionId: string): Promise<void> => {
  const sessionKey = `session:${sessionId}`;

  //delete it delete from Redis
  await redis.del(sessionKey);

  console.log(`✅ Session deactivated (deleted from Redis):`, sessionId);
};

//Check if session id valid
export const isSessionValid = async (sessionId: string): Promise<boolean> => {
  const sessionKey = `session:${sessionId}`;

  const sessionDataString = await redis.get(sessionKey);

  if (!sessionDataString) {
    console.log(`❌ Session not found or expired`, sessionId);
    return false;
  }

  const sessionData: SessionData = JSON.parse(sessionDataString);

  if (!sessionData.isActive) {
    console.log("❌ Session is not active", sessionId);
  }

  console.log("✅ session is valid:", sessionId);
  return true;
};

// get all active sessions for a user (for UI)
export const getUserActiveSessions = async (
  userId: string,
): Promise<SessionData[]> => {
  //scan all session keys
  const keys = await redis.keys("session:*");

  const sessions: SessionData[] = [];

  for (const key of keys) {
    const sessionDataString = await redis.get(key);

    if (sessionDataString) {
      const sessionData: SessionData = JSON.parse(sessionDataString);

      if (sessionData.userId === userId && sessionData.isActive) {
        sessions.push(sessionData);
      }
    }
  }

  return sessions.sort(
    (a, b) => new Date(b.loginTime).getTime() - new Date(a.loginTime).getTime(),
  );
};

//helper generate sessionId
const generateSessionId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};
