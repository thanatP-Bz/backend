import { ObjectId } from "mongoose";

export interface IUser {
  _id: ObjectId;
  email: string;
  password: string;
  name: string;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
}
