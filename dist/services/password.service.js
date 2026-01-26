"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgetPassword = exports.changePassword = void 0;
const ApiError_1 = require("../utils/ApiError");
const sendEmail_1 = require("../utils/sendEmail");
const authModel_1 = require("../models/authModel");
const crypto_1 = __importDefault(require("crypto"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const generateResetToken_1 = require("../utils/generateResetToken");
const emailTemplate_1 = require("../utils/emailTemplate");
//**************reset password***************//
const changePassword = async (email, oldPassword, newPassword) => {
    const user = await authModel_1.User.findOne({ email });
    if (!user) {
        throw new ApiError_1.ApiError("user not found", 404);
    }
    // ✅ Prevent OAuth users from changing password
    if (!user.password) {
        throw new ApiError_1.ApiError("Cannot change password. You signed in with Google.", 400);
    }
    const match = await bcrypt_1.default.compare(oldPassword, user.password);
    if (!match) {
        throw new ApiError_1.ApiError("Old password does not match", 400);
    }
    if (oldPassword === newPassword) {
        throw new ApiError_1.ApiError("New password must be different from old password", 400);
    }
    user.password = newPassword;
    await user.save();
    return {
        message: "password change successfully!",
    };
};
exports.changePassword = changePassword;
//**************forget password***************//
const forgetPassword = async (email) => {
    const user = await authModel_1.User.findOne({ email });
    if (!user) {
        return {
            message: "If email exists, reset link sent",
        };
    }
    // ✅ Cooldown FIRST
    if (user.resetPasswordExpiry &&
        user.resetPasswordExpiry.getTime() > Date.now()) {
        return {
            message: "Reset email already sent. Please check your inbox.",
        };
    }
    // ✅ Generate token
    const { resetToken, hashedToken } = (0, generateResetToken_1.generateResetToken)();
    // ✅ Store token + expiry
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    try {
        const emailContent = (0, emailTemplate_1.getPasswordResetEmail)(resetUrl, user.name);
        await (0, sendEmail_1.sendEmail)({
            to: user.email,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text,
        });
        return { message: "Reset link sent" };
    }
    catch (error) {
        user.resetPasswordToken = null;
        user.resetPasswordExpiry = null;
        await user.save();
        throw new ApiError_1.ApiError("Error sending email. Please try again", 500);
    }
};
exports.forgetPassword = forgetPassword;
//**************reset password***************//
const resetPassword = async (token, password) => {
    const hashedToken = crypto_1.default.createHash("sha256").update(token).digest("hex");
    const user = await authModel_1.User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpiry: { $gt: Date.now() },
    });
    if (!user) {
        throw new ApiError_1.ApiError("Token invalid or expired", 400);
    }
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpiry = null;
    await user.save();
    // Send confirmation email (non-blocking)
    (0, sendEmail_1.sendEmail)({
        to: user.email,
        ...(0, emailTemplate_1.getPasswordResetConfirmationEmail)(user.name || user.email),
    }).catch(console.error);
    return { message: "Password reset successful" };
};
exports.resetPassword = resetPassword;
//# sourceMappingURL=password.service.js.map