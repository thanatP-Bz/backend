"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.regenerateBackendCodesController = exports.disable2FAController = exports.verify2FASetupController = exports.enable2FAController = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const _2FA_service_1 = require("../services/2FA.service");
const ApiError_1 = require("../utils/ApiError");
const authModel_1 = require("../models/authModel");
//enable 2FA
exports.enable2FAController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const email = user?.email;
    if (!email) {
        throw new ApiError_1.ApiError("Unauthorized", 401);
    }
    const result = await (0, _2FA_service_1.enabled2FA)(email);
    return res.status(200).json(result);
});
//verify 2FA
exports.verify2FASetupController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const email = user?.email;
    const { token } = req.body;
    if (!email) {
        throw new ApiError_1.ApiError("Unauthorized", 401);
    }
    // ✅ ADD THIS: Prevent OAuth users from enabling 2FA
    if (!user.password) {
        throw new ApiError_1.ApiError("Cannot enable 2FA. You signed in with Google.", 400);
    }
    if (!token) {
        throw new ApiError_1.ApiError("token is required");
    }
    const result = await (0, _2FA_service_1.verify2FASetup)(email, token);
    return res.status(200).json(result);
});
//disable2FA
exports.disable2FAController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const authUser = req.user;
    if (!authUser?.email) {
        throw new ApiError_1.ApiError("Unauthorized", 401);
    }
    // 🔥 Fetch full user from DB
    const user = await authModel_1.User.findOne({ email: authUser.email });
    if (!user) {
        throw new ApiError_1.ApiError("User not found", 404);
    }
    console.log("🔍 User authProvider:", user.authProvider);
    if (user.authProvider === "google") {
        const result = await (0, _2FA_service_1.disable2FA)(user.email, null);
        return res.status(200).json(result);
    }
    const { password } = req.body;
    if (!password) {
        throw new ApiError_1.ApiError("Password is required", 401);
    }
    const result = await (0, _2FA_service_1.disable2FA)(user.email, password);
    return res.status(200).json(result);
});
//regenrate backup codes
exports.regenerateBackendCodesController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const email = user?.email;
    if (!email) {
        throw new ApiError_1.ApiError("Unathorized", 401);
    }
    const result = await (0, _2FA_service_1.regenerateBackupCodes)(email);
    return res.status(200).json(result);
});
//# sourceMappingURL=2FAController.js.map