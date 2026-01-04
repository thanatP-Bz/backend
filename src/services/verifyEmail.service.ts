import { User } from "../models/authModel";
import { ApiError } from "../utils/ApiError";
import crypto from "crypto";
import { getVerificationEmail } from "../utils/emailTemplate";
import { sendEmail } from "../utils/sendEmail";
//**************verify Email***************//
export const verifyEmail = async (token: string) => {
  const user = await User.findOne({ verificationToken: token });
  console.log("Looking for token:", token);

  console.log("User found:", user);

  if (!user) {
    throw new ApiError("Invalid verification token", 400);
  }

  //check if token expired
  if (
    user.verificationTokenExpiry &&
    user.verificationTokenExpiry < new Date()
  ) {
    throw new ApiError("Verification token has expired", 400);
  }

  //verify user
  user.isVerified = true;
  user.verificationToken = null;
  user.verificationTokenExpiry = null;
  await user.save();

  return { message: "Email verified successfully! You can now login!" };
};

//**************resend verify Email***************//
export const resendVerificationEmail = async (email: string) => {
  const user = await User.findOne({ email });

  if (!user) {
    return {
      message: "If email exists, verification link sent",
    };
  }

  if (user.isVerified) {
    throw new ApiError("Email already verified", 400);
  }

  // Cooldown check (prevent spam)
  if (
    user.verificationTokenExpiry &&
    user.verificationTokenExpiry.getTime() > Date.now()
  ) {
    return {
      message: "Verification email already sent. Please check your inbox",
    };
  }

  // Generate new token
  const verificationToken = crypto.randomBytes(32).toString("hex");
  user.verificationToken = verificationToken;
  user.verificationTokenExpiry = new Date(Date.now() + 1 * 60 * 1000); // 1 min for testing
  await user.save(); // ← Don't forget to save!

  // ✅ Fixed: Removed extra } and fixed typo
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

  try {
    const emailContent = getVerificationEmail(verificationUrl, user.name);

    await sendEmail({
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    return { message: "Verification email resent" };
  } catch (error) {
    throw new ApiError("Error sending email. Please try again", 500);
  }
};
