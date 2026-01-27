import { User } from "../models/authModel";
import { ApiError } from "../utils/ApiError";
import crypto from "crypto";
import { getVerificationEmail } from "../utils/emailTemplate";
import { sendEmail } from "../utils/sendEmail";
//**************verify Email***************//
export const verifyEmail = async (token: string) => {
  // Now try the normal query
  const user = await User.findOne({ verificationToken: token });

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
    // Check if user exists but already verified
    const verifiedUser = await User.findOne({
      email: { $exists: true },
      isVerified: true,
      verificationToken: null,
    });

    if (verifiedUser) {
      throw new ApiError("Email already verified. Please log in.", 400);
    }

    throw new ApiError("Invalid or expired verification token", 400);
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

    await sendEmail(user.email, emailContent.subject, emailContent.html);

    return { message: "Verification email resent" };
  } catch (error) {
    throw new ApiError("Error sending email. Please try again", 500);
  }
};
