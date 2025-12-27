import { ApiError } from "../utils/ApiError";
import { sendEmail } from "../utils/sendEmail";
import { User } from "../models/authModel";
import crypto from "crypto";
import { generateResetToken } from "../utils/generateResetToken";
import {
  getPasswordResetConfirmationEmail,
  getPasswordResetEmail,
} from "../utils/emailTemplate";

//**************forget password***************//
export const forgetPassword = async (email: string) => {
  const user = await User.findOne({ email });

  if (!user) {
    return {
      message: "If email exists, reset link sent",
    };
  }

  // ✅ Cooldown FIRST
  if (
    user.resetPasswordExpiry &&
    user.resetPasswordExpiry.getTime() > Date.now()
  ) {
    return {
      message: "Reset email already sent. Please check your inbox.",
    };
  }

  // ✅ Generate token
  const { resetToken, hashedToken } = generateResetToken();

  // ✅ Store token + expiry
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpiry = new Date(Date.now() + 15 * 60 * 1000);

  await user.save();

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  try {
    const emailContent = getPasswordResetEmail(resetUrl, user.name);

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
    resetPasswordExpires: { $gt: Date.now() },
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
