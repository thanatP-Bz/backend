import { Schema, model, Model } from "mongoose";
import { IUser } from "./type";
import bcrypt from "bcrypt";
import { threadId } from "worker_threads";

export interface UserModel extends Model<IUser> {
  checkEmail(email: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

userSchema.statics.checkEmail = async function (email: string) {
  const user = await this.findOne({ email });

  if (user) {
    throw Error("Email has been already in use!");
  }
};

userSchema.pre("save", async function (next) {
  //if password is new or modified
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

export const User = model<IUser, UserModel>("User", userSchema);
