import { IUser, IUserDocument } from "../types/user";
import { User } from "../models/authModel";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken";
import { ApiError } from "../utils/ApiError";
import crypto from "crypto";
import { getVerificationEmail } from "../utils/emailTemplate";
import { sendEmail } from "../utils/sendEmail";

export const register = async (data: IUser) => {
  const { name, email, password } = data;

  // Check validation
  if (!name || !email || !password) {
    throw new ApiError("all field are required", 400);
  }

  // Check user exist
  const userExist = await User.checkEmail(email);

  if (userExist) {
    throw new ApiError("this email has been registered", 409);
  }

  //generate verification token
  const verificationToken = crypto.randomBytes(32).toString("hex");
  /*  const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); */
  const verificationTokenExpiry = new Date(Date.now() + 1 * 60 * 1000);

  const newUser = await User.create({
    name,
    email,
    password,
    isVerified: false,
    verificationToken,
    verificationTokenExpiry,
  });

  //send verification email
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

  try {
    const emailContent = getVerificationEmail(
      verificationUrl,
      newUser.name || newUser.email
    );

    await sendEmail({
      to: newUser.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    return {
      message:
        "Registration successful! Please check your email to verify your account.",
    };
  } catch (error) {
    // If email fails, delete the user or mark for cleanup
    await User.findByIdAndDelete(newUser._id);
    throw new ApiError(
      "Error sending verification email. Please try again",
      500
    );
  }

  /*before add verify email => const accessToken = generateAccessToken(newUser._id.toString());
  const refreshToken = generateRefreshToken(newUser._id.toString());

  // ✅ FIX: Save refresh token to database!
  newUser.refreshToken = refreshToken;
  newUser.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await newUser.save();

  return {
    message: "User register Successfully!",
    accessToken,
    refreshToken,
    user: {
      id: newUser._id,
      email: newUser.email,
      name: newUser.name, // ← Don't return password!
    },
  }; */
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
