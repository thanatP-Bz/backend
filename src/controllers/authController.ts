import { NextFunction, Request, Response } from "express";
import { IUser } from "../types/user";
import { User } from "../models/authModel";
import { generateToken } from "../utils/generateToken";
import { generateResetToken } from "../utils/generateResetToken";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import bcrypt from "bcrypt";
import crypto from "crypto";

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
      console.log(`Forgot password requested for non-existent email: ${email}`);
      return res.status(200).json({
        message: "If email exists, reset link sent",
      });
    }
    const { resetToken, hashedToken } = generateResetToken();

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    console.log("Reset Link:", resetUrl);

    res.status(200).json({ message: "Reset link sent" });

    console.log("DB TOKEN:", user.resetPasswordToken);
    console.log("EXPIRES:", user.resetPasswordExpires);
  }
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
      throw new ApiError("Reset token missing", 400);
    }

    // Hash the token from the URL
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with matching hashed token and not expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new ApiError("Token invalid or expired", 400);
    }

    // Hash new password
    user.password = await bcrypt.hash(password, 10);

    // Save updated user
    await user.save();

    // Response
    res.status(200).json({ message: "Password reset successful" });

    // Logs for debugging (optional)
    console.log("RAW TOKEN:", token);
    console.log("HASHED TOKEN:", hashedToken);
  }
);
