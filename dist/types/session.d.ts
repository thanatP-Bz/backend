import { Types } from "mongoose";
export interface ISession {
    userId: Types.ObjectId;
    loginTime: Date;
    lastActivity: Date;
    expiresAt: Date;
    ipAddress: string;
    userAgent: string;
    isActive: boolean;
}
export interface ISessionDocument extends ISession, Document {
    _id: Types.ObjectId;
}
//# sourceMappingURL=session.d.ts.map