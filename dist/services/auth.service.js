"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.verify2FALogin = exports.login = exports.register = void 0;
const authModel_1 = require("../models/authModel");
const generateToken_1 = require("../utils/generateToken");
const ApiError_1 = require("../utils/ApiError");
const crypto_1 = __importDefault(require("crypto"));
const emailTemplate_1 = require("../utils/emailTemplate");
const sendEmail_1 = require("../utils/sendEmail");
const _2FA_service_1 = require("./2FA.service");
const register = async (data) => {
    const { name, email, password } = data;
    // Check validation
    if (!name || !email || !password) {
        throw new ApiError_1.ApiError("all field are required", 400);
    }
    // Check user exist
    const userExist = await authModel_1.User.checkEmail(email);
    if (userExist) {
        throw new ApiError_1.ApiError("this email has been registered", 409);
    }
    //generate verification token
    const verificationToken = crypto_1.default.randomBytes(32).toString("hex");
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const newUser = await authModel_1.User.create({
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
        const emailContent = (0, emailTemplate_1.getVerificationEmail)(verificationUrl, newUser.name || newUser.email);
        await (0, sendEmail_1.sendEmail)({
            to: newUser.email,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text,
        });
        return {
            user: {
                _id: newUser._id.toString(),
                email: newUser.email,
                name: newUser.name,
            },
            message: "Registration successful! Please check your email to verify your account.",
        };
    }
    catch (error) {
        await authModel_1.User.findByIdAndDelete(newUser._id);
        throw new ApiError_1.ApiError("Error sending verification email. Please try again", 500);
    }
};
exports.register = register;
const login = async (data) => {
    const { email, password } = data;
    const user = (await authModel_1.User.login(email, password));
    //check is 2FA is enable
    if (user.twoFactorEnabled) {
        return {
            requires2FA: true,
            message: "Please enter your 2FA code",
            userId: user._id.toString(),
        };
    }
    const accessToken = (0, generateToken_1.generateAccessToken)(user._id.toString());
    const refreshToken = (0, generateToken_1.generateRefreshToken)(user._id.toString());
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
            hasPassword: !!user.password,
        },
    };
};
exports.login = login;
/* verify 2FA login */
const verify2FALogin = async (userId, token) => {
    const user = (await authModel_1.User.findById(userId));
    if (!user) {
        throw new ApiError_1.ApiError("User not found", 404);
    }
    if (!user.twoFactorEnabled) {
        throw new ApiError_1.ApiError("2FA is not enabled for this user", 400);
    }
    //verify 2FA token
    const isValid = await (0, _2FA_service_1.verify2FAToken)(user.email, token);
    if (!isValid) {
        throw new ApiError_1.ApiError("invalid 2FA code", 400);
    }
    const accessToken = (0, generateToken_1.generateAccessToken)(user._id.toString());
    const refreshToken = (0, generateToken_1.generateRefreshToken)(user._id.toString());
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
            twoFactorEnabled: true,
        },
    };
};
exports.verify2FALogin = verify2FALogin;
const logout = async (userId) => {
    // Clear refresh token from database
    const user = await authModel_1.User.findByIdAndUpdate(userId, {
        refreshToken: null,
        refreshTokenExpiry: null,
    }, { new: true });
    if (!user) {
        throw new ApiError_1.ApiError("User not found", 404);
    }
    return {
        message: "Logged out successfully",
    };
};
exports.logout = logout;
//# sourceMappingURL=auth.service.js.map