import { NextFunction, Request, Response } from "express";
import { IUser } from "../types/user";
import { User } from "../models/authModel";
import { generateToken } from "../utils/generateToken";
import { generateResetToken } from "../utils/generateResetToken";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import bcrypt from "bcrypt"

export const registerUser = asyncHandler(
  async (req: Request<{}, {}, IUser>, res: Response) => {
    const { name, email, password } = req.body;

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
  }
);

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
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
});

///forget password and reset password

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      throw new ApiError("user not found", 400);
    }

    const { resetToken, hashedToken } = generateResetToken();

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpired = new Date(Date.now() + 15 * 60 * 1000);

    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    console.log("Reset Link:", resetUrl);

    res.status(200).json({ message: "Reset link set" });
  }
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { token } = req.params;
    const { password } = req.body;

    const { hashedToken } = generateResetToken();

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpired: { $gt: Date.now() },
    });

    if (!user) {
      throw new ApiError("Token Invalid or Expired", 400);
    }

    user.password = await 
  }
);
