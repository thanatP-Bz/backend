import { Types, Document } from "mongoose";

export interface IUser {
  email: string;
  password: string;
  name: string;
  isVerified: boolean;
  verificationToken: string | null;
  verificationTokenExpiry: Date | null;
  resetPasswordToken?: string | null;
  resetPasswordExpiry?: Date | null;
  refreshToken: string | null;
  refreshTokenExpiry: Date | null;
  twoFactorSecret?: string | undefined;
  twoFactorEnabled: boolean;
  backupCodes?: string[] | undefined;
}

export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;
}
