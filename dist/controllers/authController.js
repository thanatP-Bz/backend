"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutController = exports.refreshTokenController = exports.resetPasswordController = exports.forgetPasswordController = exports.changePasswordController = exports.resendVerifyEmailController = exports.verify2FALoginController = exports.loginController = exports.verifyEmailController = exports.registerController = void 0;
const ApiError_1 = require("../utils/ApiError");
const asyncHandler_1 = require("../utils/asyncHandler");
const auth_service_1 = require("../services/auth.service");
const password_service_1 = require("../services/password.service");
const token_service_1 = require("../services/token.service");
const verifyEmail_service_1 = require("../services/verifyEmail.service");
const session_service_1 = require("../services/session.service");
//**************Register***************//
exports.registerController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, auth_service_1.register)(req.body);
    res.status(200).json(result);
});
//**************verify Email***************//
exports.verifyEmailController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { token } = req.query;
    console.log(token);
    if (!token || typeof token !== "string") {
        throw new ApiError_1.ApiError("Verification token is required", 400);
    }
    const result = await (0, verifyEmail_service_1.verifyEmail)(token);
    res.status(200).json(result);
});
//**************Login***************//
exports.loginController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, auth_service_1.login)(req.body);
    //check 2FA
    if ("requires2FA" in result && result.requires2FA) {
        // 2FA required - don't create session or set cookies
        return res.status(200).json({
            requires2FA: true,
            message: result.message,
            userId: result.userId,
        });
    }
    //new: create session
    const session = await (0, session_service_1.createSession)({
        userId: result.user._id.toString(),
        ipAddress: req.ip || req.socket.remoteAddress || "unknown",
        userAgent: req.headers["user-agent"] || "unknown",
    });
    res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    //set sessionId cookie
    res.cookie("sessionId", session._id.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
        message: result.message,
        user: result.user,
    });
});
//**************verify 2FA Login***************//
exports.verify2FALoginController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId, token } = req.body;
    if (!userId || !token) {
        return res.status(400).json({ message: "User ID and 2FA are required" });
    }
    const result = await (0, auth_service_1.verify2FALogin)(userId, token);
    //new: create session
    const session = await (0, session_service_1.createSession)({
        userId: result.user._id.toString(),
        ipAddress: req.ip || req.socket.remoteAddress || "unknown",
        userAgent: req.headers["user-agent"] || "unknown",
    });
    res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    //set sessionId cookie
    res.cookie("sessionId", session._id.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
        message: result.message,
        user: result.user,
    });
});
//**************resend verify Email***************//
exports.resendVerifyEmailController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email } = req.body;
    const result = await (0, verifyEmail_service_1.resendVerificationEmail)(email);
    res.status(200).json(result);
});
//**************change Password***************//
exports.changePasswordController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, oldPassword, newPassword } = req.body;
    const result = await (0, password_service_1.changePassword)(email, oldPassword, newPassword);
    return res.status(200).json(result);
});
//**************Forget Password***************//
exports.forgetPasswordController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email } = req.body;
    if (!email)
        throw new ApiError_1.ApiError("Email is required", 400);
    const result = await (0, password_service_1.forgetPassword)(email);
    res.status(200).json(result);
});
//**************Reset Password***************//
exports.resetPasswordController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    if (!token || !password)
        throw new ApiError_1.ApiError("Token and password are required", 400);
    const result = await (0, password_service_1.resetPassword)(token, password);
    res.status(200).json(result);
});
//**************Refresh Token***************//
exports.refreshTokenController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token) {
        throw new ApiError_1.ApiError("Refresh token not found", 401);
    }
    const result = await (0, token_service_1.refreshToken)(token);
    res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.status(200).json({
        message: "Token refreshed successfully",
        accessToken: result.accessToken,
    });
});
//**************logout***************//
exports.logoutController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const userId = user?._id.toString() || req.body.userId;
    //get sessionId from cookie and deactivate it
    const sessionId = req.cookies.sessionId;
    if (sessionId) {
        await (0, session_service_1.deactivateSession)(sessionId);
    }
    const result = await (0, auth_service_1.logout)(userId);
    // ✅ Clear the cookie!
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.clearCookie("sessionId");
    res.status(200).json(result);
});
//# sourceMappingURL=authController.js.map