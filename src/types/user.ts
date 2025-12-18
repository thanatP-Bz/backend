import { ObjectId } from "mongoose";

export interface IUser {
  _id: ObjectId;
  email: string;
  password: string;
  name: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date | null;
}
