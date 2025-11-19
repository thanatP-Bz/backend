import { NextFunction, Request, Response } from "express";
import { IUser } from "../models/type";
import { User } from "../models/Model";
import { generateToken } from "../utils/generateToken";
import { ApiError } from "../utils/ApiError";

export const registerUser = async (
  req: Request<{}, {}, IUser>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password } = req.body;

    //check validation
    if (!name || !email || !password) {
      throw new ApiError("all field are required", 401);
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

    // token
    const token = generateToken(newUser._id.toString());

    return res.status(201).json({
      message: "User register Successfully!",
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        password: newUser.password,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    const user = await User.login(email, password);

    const token = generateToken((user as any)._id);

    res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error: any) {
    next(error);
  }
};
