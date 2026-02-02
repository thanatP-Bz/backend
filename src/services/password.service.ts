import { ApiError } from "../utils/ApiError";
import { sendEmail } from "../utils/email(Resend)/sendEmail";
import { User } from "../models/authModel";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { generateResetToken } from "../utils/token/generateResetToken";
import {
  getPasswordResetConfirmationEmail,
  getPasswordResetEmail,
} from "../utils/email(Resend)/emailTemplate";

//**************reset password***************//
export const changePassword = async (
  email: string,
  oldPassword: string,
  newPassword: string,
) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError("user not found", 404);
  }

  // ✅ Prevent OAuth users from changing password
  if (!user.password) {
    throw new ApiError(
      "Cannot change password. You signed in with Google.",
      400,
    );
  }

  const match = await bcrypt.compare(oldPassword, user.password);

  if (!match) {
    throw new ApiError("Old password does not match", 400);
  }

  if (oldPassword === newPassword) {
    throw new ApiError("New password must be different from old password", 400);
  }

  user.password = newPassword;
  await user.save();
  return {
    message: "password change successfully!",
  };
};

//**************forget password***************//
export const forgetPassword = async (email: string) => {
  const user = await User.findOne({ email });

  if (!user) {
    return {
      message: "If email exists, reset link sent",
    };
  }

  // ✅ Cooldown FIRST
  /*   if (
    user.resetPasswordExpiry &&
    user.resetPasswordExpiry.getTime() > Date.now()
  ) {
    return {
      message: "Reset email already sent. Please check your inbox.",
    };
  } */

  // ✅ Generate token
  const { resetToken, hashedToken } = generateResetToken();

  // ✅ Store token + expiry
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpiry = new Date(Date.now() + 15 * 60 * 1000);

  await user.save();

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  try {
    const emailContent = getPasswordResetEmail(resetUrl, user.name);

    console.log("Environment check:");
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("FRONTEND_URL:", process.env.FRONTEND_URL);
    console.log("Generated resetUrl:", resetUrl);

    await sendEmail({
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    return { message: "Reset link sent" };
  } catch (error) {
    user.resetPasswordToken = null;
    user.resetPasswordExpiry = null;

    await user.save();

    throw new ApiError("Error sending email. Please try again", 500);
  }
};

//**************reset password***************//

export const resetPassword = async (token: string, password: string) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError("Token invalid or expired", 400);
  }

  user.password = password;
  user.resetPasswordToken = null;
  user.resetPasswordExpiry = null;
  await user.save();

  // Send confirmation email (non-blocking)
  sendEmail({
    to: user.email,
    ...getPasswordResetConfirmationEmail(user.name || user.email),
  }).catch(console.error);

  return { message: "Password reset successful" };
};
