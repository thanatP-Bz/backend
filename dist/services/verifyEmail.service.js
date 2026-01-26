"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendVerificationEmail = exports.verifyEmail = void 0;
const authModel_1 = require("../models/authModel");
const ApiError_1 = require("../utils/ApiError");
const crypto_1 = __importDefault(require("crypto"));
const emailTemplate_1 = require("../utils/emailTemplate");
const sendEmail_1 = require("../utils/sendEmail");
//**************verify Email***************//
const verifyEmail = async (token) => {
    // Now try the normal query
    const user = await authModel_1.User.findOne({ verificationToken: token });
    if (!user) {
        throw new ApiError_1.ApiError("Invalid verification token", 400);
    }
    //check if token expired
    if (user.verificationTokenExpiry &&
        user.verificationTokenExpiry < new Date()) {
        throw new ApiError_1.ApiError("Verification token has expired", 400);
    }
    //verify user
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    await user.save();
    return { message: "Email verified successfully! You can now login!" };
};
exports.verifyEmail = verifyEmail;
//**************resend verify Email***************//
const resendVerificationEmail = async (email) => {
    const user = await authModel_1.User.findOne({ email });
    if (!user) {
        // Check if user exists but already verified
        const verifiedUser = await authModel_1.User.findOne({
            email: { $exists: true },
            isVerified: true,
            verificationToken: null,
        });
        if (verifiedUser) {
            throw new ApiError_1.ApiError("Email already verified. Please log in.", 400);
        }
        throw new ApiError_1.ApiError("Invalid or expired verification token", 400);
    }
    // Cooldown check (prevent spam)
    if (user.verificationTokenExpiry &&
        user.verificationTokenExpiry.getTime() > Date.now()) {
        return {
            message: "Verification email already sent. Please check your inbox",
        };
    }
    // Generate new token
    const verificationToken = crypto_1.default.randomBytes(32).toString("hex");
    user.verificationToken = verificationToken;
    user.verificationTokenExpiry = new Date(Date.now() + 1 * 60 * 1000); // 1 min for testing
    await user.save(); // ← Don't forget to save!
    // ✅ Fixed: Removed extra } and fixed typo
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    try {
        const emailContent = (0, emailTemplate_1.getVerificationEmail)(verificationUrl, user.name);
        await (0, sendEmail_1.sendEmail)({
            to: user.email,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text,
        });
        return { message: "Verification email resent" };
    }
    catch (error) {
        throw new ApiError_1.ApiError("Error sending email. Please try again", 500);
    }
};
exports.resendVerificationEmail = resendVerificationEmail;
//# sourceMappingURL=verifyEmail.service.js.map