import { IUser, IUserDocument } from "../types/user";
import { User } from "../models/authModel";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken";
import { ApiError } from "../utils/ApiError";

export const register = async (data: IUser) => {
  const { name, email, password } = data;

  //check validation
  if (!name || !email || !password) {
    throw new ApiError("all field are required", 400);
  }

  //check user exist
  const userExist = await User.checkEmail(email);

  if (userExist) {
    throw new ApiError("this email has been registered", 409);
  }

  const newUser = await User.create({
    name,
    email,
    password,
  });

  const accessToken = generateAccessToken(newUser._id.toString());
  const refreshToken = generateRefreshToken(newUser._id.toString());

  return {
    message: "User register Successfully!",
    accessToken,
    refreshToken,
    user: {
      id: newUser._id,
      email: newUser.email,
      password: newUser.password,
    },
  };
};

export const login = async (data: IUser) => {
  const { email, password } = data;

  const user = (await User.login(email, password)) as IUserDocument;

  const accessToken = generateAccessToken(user._id.toString());
  const refreshToken = generateRefreshToken(user._id.toString());

  user.refreshToken = refreshToken;
  user.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await user.save();

  return {
    message: "Login Successful",
    accessToken,
    refreshToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
    },
  };
};
