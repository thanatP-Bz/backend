"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = void 0;
const authModel_1 = require("../models/authModel");
const ApiError_1 = require("../utils/ApiError");
const generateToken_1 = require("../utils/generateToken");
const refreshToken = async (refreshToken) => {
    if (!refreshToken)
        throw new ApiError_1.ApiError("Refresh Token Required", 401);
    const decoded = (0, generateToken_1.verifyRefreshToken)(refreshToken);
    if (!decoded) {
        throw new ApiError_1.ApiError("Invalid refresh Token", 401);
    }
    // First, check if user exists
    const userExists = await authModel_1.User.findById(decoded._id);
    if (!userExists)
        throw new ApiError_1.ApiError("User Not Found", 404);
    const user = await authModel_1.User.findOne({
        _id: decoded._id,
        refreshToken: refreshToken,
        refreshTokenExpiry: { $gt: Date.now() },
    });
    if (!user)
        throw new ApiError_1.ApiError("Invalid refresh token", 401);
    const newAccessToken = (0, generateToken_1.generateAccessToken)(user._id.toString());
    const newRefreshToken = (0, generateToken_1.generateRefreshToken)(user._id.toString());
    user.refreshToken = newRefreshToken;
    user.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await user.save();
    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
    };
};
exports.refreshToken = refreshToken;
//# sourceMappingURL=token.service.js.map