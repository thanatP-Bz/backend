import speakeasy from "speakeasy";
import qrcode from "qrcode";
import bcrypt from "bcrypt";
import { User } from "../models/authModel";
import { ApiError } from "../utils/ApiError";
import {
  generateBackupCodes,
  hashBackupCode,
  veirifyBackupCode,
} from "../utils/2FABackupCodes";
import { IUserDocument } from "../types/user";

/* Generate 2FA secret and QR code for user */
export const enabled2FA = async (email: string) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  if (user.twoFactorEnabled) {
    throw new ApiError("2FA is already enabled", 400);
  }

  /* Check if user already has a secret (from previous setup) */
  let secret;
  let qrCodeUrl;

  if (user.twoFactorSecret) {
    // ✅ User has existing secret - reuse it!
    secret = {
      base32: user.twoFactorSecret,
      otpauth_url: `otpauth://totp/TaskApp:${user.email}?secret=${user.twoFactorSecret}&issuer=TaskApp`,
    };
  } else {
    // ✅ No existing secret - generate new one
    secret = speakeasy.generateSecret({
      name: `TaskApp (${user.email})`,
      issuer: "TaskApp",
    });

    // Save the new secret
    user.twoFactorSecret = secret.base32;
    await user.save();
  }

  /* Generate QR code from the secret (existing or new) */
  qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url!);

  return {
    secret: secret.base32,
    qrCode: qrCodeUrl,
    message:
      "Scan QR code with your authenticator app and verify with the code",
  };
};

//verify 2FA by checking the TOTP code
export const verify2FASetup = async (email: string, token: string) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  if (!user.twoFactorSecret) {
    throw new ApiError(
      "2FA setup not initiated. Please enable 2 FA first",
      400,
    );
  }

  if (user.twoFactorEnabled) {
    throw new ApiError("2FA is already enabled", 400);
  }

  //verify the token
  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token: token,
    window: 2,
  });

  if (!verified) {
    throw new ApiError("Invalid verification code", 400);
  }

  const backupCodes = generateBackupCodes();

  //enabled 2 FA
  user.twoFactorEnabled = true;
  user.backupCodes = backupCodes.map((code) => hashBackupCode(code));
  await user.save();

  return {
    message: "2FA enabled sucessfully!",
    backupCodes,
  };
};

//Verify TOTP token during login
export const verify2FAToken = async (
  email: string,
  token: string,
): Promise<boolean> => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  if (!user.twoFactorEnabled || !user.twoFactorSecret) {
    throw new ApiError("2FA is not enabled for this user", 400);
  }

  //check the back up codes if input length === 8
  if (token.length === 8) {
    return veirifyBackupCode(user as IUserDocument, token);
  }

  //verify TOTP token
  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token: token,
    window: 2,
  });

  if (!verified) {
    throw new ApiError("Invalid 2FA code", 400);
  }

  return true;
};

//disable 2FA for user
export const disable2FA = async (email: string, password: string | null) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  if (!user.twoFactorEnabled) {
    throw new ApiError("2FA is not enabled", 400);
  }

  // ✅ Check if user is OAuth user (no password required)
  if (user.authProvider === "google") {
    // OAuth users don't have passwords, skip password check
    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    user.backupCodes = [];
    await user.save();

    return {
      message: "2FA disable successfully!",
      twoFactorEnabled: false,
    };
  }

  // For regular email/password users, verify password
  if (!password) {
    throw new ApiError("Password is required", 400);
  }

  if (!user.password) {
    throw new ApiError("User has no password set", 400);
  }

  //verify password before disabling (password is guaranteed to be string here)
  const match = await bcrypt.compare(password as string, user.password);

  if (!match) {
    throw new ApiError("Incorrect Password", 400);
  }

  //disable 2FA and clean up all 2FA data
  user.twoFactorEnabled = false;
  user.twoFactorSecret = undefined; // ✅ ADDED: Clear the secret
  user.backupCodes = []; // ✅ ADDED: Clear backup codes
  await user.save();

  return {
    message: "2FA disable successfully!",
    twoFactorEnabled: false,
  };
};

//regenerate backup codes
export const regenerateBackupCodes = async (email: string) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  if (!user.twoFactorEnabled) {
    throw new ApiError("2FA is not enabled", 400);
  }

  const backupCodes = generateBackupCodes();
  user.backupCodes = backupCodes.map((code) => hashBackupCode(code));
  await user.save();

  return {
    message: "Backup codes regenerated successfully!",
    backupCodes,
  };
};
