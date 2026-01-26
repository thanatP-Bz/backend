"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.regenerateBackupCodes = exports.disable2FA = exports.verify2FAToken = exports.verify2FASetup = exports.enabled2FA = void 0;
const speakeasy_1 = __importDefault(require("speakeasy"));
const qrcode_1 = __importDefault(require("qrcode"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const authModel_1 = require("../models/authModel");
const ApiError_1 = require("../utils/ApiError");
const _2FABackupCodes_1 = require("../utils/2FABackupCodes");
/* Generate 2FA secret and QR code for user */
const enabled2FA = async (email) => {
    const user = await authModel_1.User.findOne({ email });
    if (!user) {
        throw new ApiError_1.ApiError("User not found", 404);
    }
    if (user.twoFactorEnabled) {
        throw new ApiError_1.ApiError("2FA is already enabled", 400);
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
    }
    else {
        // ✅ No existing secret - generate new one
        secret = speakeasy_1.default.generateSecret({
            name: `TaskApp (${user.email})`,
            issuer: "TaskApp",
        });
        // Save the new secret
        user.twoFactorSecret = secret.base32;
        await user.save();
    }
    /* Generate QR code from the secret (existing or new) */
    qrCodeUrl = await qrcode_1.default.toDataURL(secret.otpauth_url);
    return {
        secret: secret.base32,
        qrCode: qrCodeUrl,
        message: "Scan QR code with your authenticator app and verify with the code",
    };
};
exports.enabled2FA = enabled2FA;
//verify 2FA by checking the TOTP code
const verify2FASetup = async (email, token) => {
    const user = await authModel_1.User.findOne({ email });
    if (!user) {
        throw new ApiError_1.ApiError("User not found", 404);
    }
    if (!user.twoFactorSecret) {
        throw new ApiError_1.ApiError("2FA setup not initiated. Please enable 2 FA first", 400);
    }
    if (user.twoFactorEnabled) {
        throw new ApiError_1.ApiError("2FA is already enabled", 400);
    }
    //verify the token
    const verified = speakeasy_1.default.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: token,
        window: 2,
    });
    if (!verified) {
        throw new ApiError_1.ApiError("Invalid verification code", 400);
    }
    const backupCodes = (0, _2FABackupCodes_1.generateBackupCodes)();
    //enabled 2 FA
    user.twoFactorEnabled = true;
    user.backupCodes = backupCodes.map((code) => (0, _2FABackupCodes_1.hashBackupCode)(code));
    await user.save();
    return {
        message: "2FA enabled sucessfully!",
        backupCodes,
    };
};
exports.verify2FASetup = verify2FASetup;
//Verify TOTP token during login
const verify2FAToken = async (email, token) => {
    const user = await authModel_1.User.findOne({ email });
    if (!user) {
        throw new ApiError_1.ApiError("User not found", 404);
    }
    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
        throw new ApiError_1.ApiError("2FA is not enabled for this user", 400);
    }
    //check the back up codes if input length === 8
    if (token.length === 8) {
        return (0, _2FABackupCodes_1.veirifyBackupCode)(user, token);
    }
    //verify TOTP token
    const verified = speakeasy_1.default.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: token,
        window: 2,
    });
    if (!verified) {
        throw new ApiError_1.ApiError("Invalid 2FA code", 400);
    }
    return true;
};
exports.verify2FAToken = verify2FAToken;
//disable 2FA for user
const disable2FA = async (email, password) => {
    const user = await authModel_1.User.findOne({ email });
    if (!user) {
        throw new ApiError_1.ApiError("User not found", 404);
    }
    if (!user.twoFactorEnabled) {
        throw new ApiError_1.ApiError("2FA is not enabled", 400);
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
        throw new ApiError_1.ApiError("Password is required", 400);
    }
    if (!user.password) {
        throw new ApiError_1.ApiError("User has no password set", 400);
    }
    //verify password before disabling (password is guaranteed to be string here)
    const match = await bcrypt_1.default.compare(password, user.password);
    if (!match) {
        throw new ApiError_1.ApiError("Incorrect Password", 400);
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
exports.disable2FA = disable2FA;
//regenerate backup codes
const regenerateBackupCodes = async (email) => {
    const user = await authModel_1.User.findOne({ email });
    if (!user) {
        throw new ApiError_1.ApiError("User not found", 404);
    }
    if (!user.twoFactorEnabled) {
        throw new ApiError_1.ApiError("2FA is not enabled", 400);
    }
    const backupCodes = (0, _2FABackupCodes_1.generateBackupCodes)();
    user.backupCodes = backupCodes.map((code) => (0, _2FABackupCodes_1.hashBackupCode)(code));
    await user.save();
    return {
        message: "Backup codes regenerated successfully!",
        backupCodes,
    };
};
exports.regenerateBackupCodes = regenerateBackupCodes;
//# sourceMappingURL=2FA.service.js.map