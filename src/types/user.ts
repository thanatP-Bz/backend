import { ObjectId, Document } from "mongoose";

export interface IUser {
  email: string;
  password: string;
  name: string;
  resetPasswordToken?: string | null;
  resetPasswordExpiry?: Date | null;
  refreshToken: string | null;
  refreshTokenExpiry: Date | null;
}

export interface IUserDocument extends IUser, Document {
  _id: ObjectId;
}
