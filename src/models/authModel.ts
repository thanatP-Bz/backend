import { Schema, model, Model } from "mongoose";
import { IUser } from "../types/user";
import bcrypt from "bcrypt";
import { ApiError } from "../utils/ApiError";

export interface UserModel extends Model<IUser> {
  checkEmail(email: string): Promise<boolean>;
  login(email: string, password: string): Promise<IUser>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  {
    timestamps: true,
  }
);

userSchema.statics.checkEmail = async function (email: string) {
  const user = await this.findOne({ email });

  if (user) {
    throw new ApiError("Email has been already in use!", 401);
  }
};

userSchema.statics.login = async function (email: string, password: string) {
  if (!email || !password) {
    throw new ApiError("Email and password are required", 400);
  }

  const user = await this.findOne({ email });

  if (!user) {
    throw new ApiError("incorrect Email", 400);
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw new ApiError("Incorrect Password!", 400);
  }

  return user;
};

userSchema.pre("save", async function (next) {
  //if password is new or modified
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

export const User = model<IUser, UserModel>("User", userSchema);
