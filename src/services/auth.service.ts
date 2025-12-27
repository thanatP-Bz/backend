import { IUser } from "../types/user";
import { User } from "../models/authModel";
import { generateToken } from "../utils/generateToken";
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
  const token = generateToken(newUser._id.toString());

  return {
    message: "User register Successfully!",
    token,
    user: {
      id: newUser._id,
      email: newUser.email,
      password: newUser.password,
    },
  };
};

export const login = async (data: IUser) => {
  const { email, password } = data;

  const user = await User.login(email, password);

  const token = generateToken((user as any)._id);

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
    },
    token,
  };
};
