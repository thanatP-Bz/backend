import { Types } from "mongoose";
import { ISessionDocument } from "../types/session";
interface CreateSessionInput {
    userId: string | Types.ObjectId;
    ipAddress: string;
    userAgent: string;
}
export declare const createSession: (input: CreateSessionInput) => Promise<ISessionDocument>;
export declare const updateSessionActivity: (sessionId: string) => Promise<void>;
export declare const deactivateSession: (sessionId: string) => Promise<void>;
export declare const isSessionValid: (sessionId: string) => Promise<boolean>;
export declare const cleanupExpiredSession: () => Promise<void>;
export declare const getUserActiveSessions: (userId: string) => Promise<ISessionDocument[]>;
export {};
//# sourceMappingURL=session.service.d.ts.map