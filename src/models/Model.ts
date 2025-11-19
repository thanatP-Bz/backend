import { Schema, model, Model } from "mongoose";
import { IUser } from "./type";
import bcrypt from "bcrypt";

export interface UserModel extends Model<IUser> {
  checkEmail(email: string): Promise<boolean>;
  login(email: string, password: string): Promise<IUser>;
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

userSchema.statics.login = async function (email: string, password: string) {
  if (!email || !password) {
    throw Error("All filed must be fill!");
  }

  const user = await this.findOne({ email });

  if (!user) {
    throw Error("incorrect Email");
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw Error("Incorrect Password!");
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
