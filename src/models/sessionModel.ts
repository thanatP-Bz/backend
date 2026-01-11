import { model, Schema } from "mongoose";
import { ISessionDocument } from "../types/session";

const sessionSchema = new Schema<ISessionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    loginTime: { type: Date, default: Date.now, required: true },
    lastActivity: { type: Date, default: Date.now, required: true },
    expiresAt: { type: Date, required: true },
    ipAddress: { type: String, required: true },
    userAgent: { type: String, required: true },
    isActive: { type: Boolean, default: true, required: true },
  },
  {
    timestamps: true,
  }
);

sessionSchema.index({ userId: 1, isActive: 1 });
sessionSchema.index({ expiresAt: 1 });

export const Session = model<ISessionDocument>("session", sessionSchema);
