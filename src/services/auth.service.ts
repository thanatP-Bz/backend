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
  const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  console.log("🔵 BEFORE User.create()");
  console.log("🔵 Token to save:", verificationToken);

  const newUser = await User.create({
    name,
    email,
    password,
    isVerified: false,
    verificationToken,
    verificationTokenExpiry,
  });

  console.log("🟢 AFTER User.create()");
  console.log("🟢 newUser.verificationToken:", newUser.verificationToken);

  // Check immediately what's in DB
  const freshCheck = await User.findById(newUser._id);
  console.log("🟡 Fresh from DB (immediately):", {
    verificationToken: freshCheck?.verificationToken,
    tokenLength: freshCheck?.verificationToken?.length,
  });

  // Wait 5 seconds
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // Check again after 5 seconds
  const checkAgain = await User.findById(newUser._id);
  console.log("🕐 After 5 seconds, token still there?", {
    verificationToken: checkAgain?.verificationToken,
    tokenLength: checkAgain?.verificationToken?.length,
  });

  //send verification email
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

  try {
    const emailContent = getVerificationEmail(
      verificationUrl,
      newUser.name || newUser.email
    );

    console.log("📧 BEFORE sending email");

    await sendEmail({
      to: newUser.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    console.log("📧 AFTER sending email");

    // Check AGAIN after email
    const afterEmailCheck = await User.findById(newUser._id);
    console.log("🔴 After email sent:", {
      verificationToken: afterEmailCheck?.verificationToken,
      tokenLength: afterEmailCheck?.verificationToken?.length,
    });

    return {
      user: {
        _id: newUser._id.toString(),
        email: newUser.email,
        name: newUser.name,
      },
      message:
        "Registration successful! Please check your email to verify your account.",
    };
  } catch (error) {
    await User.findByIdAndDelete(newUser._id);
    throw new ApiError(
      "Error sending verification email. Please try again",
      500
    );
  }
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
