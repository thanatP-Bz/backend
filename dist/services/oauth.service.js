"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGoogleCallback = void 0;
const generateToken_1 = require("../utils/generateToken");
const handleGoogleCallback = async (user) => {
    // Generate tokens
    const accessToken = (0, generateToken_1.generateAccessToken)(user._id.toString());
    const refreshToken = (0, generateToken_1.generateRefreshToken)(user._id.toString());
    // Save refresh token to database
    user.refreshToken = refreshToken;
    user.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await user.save();
    console.log(user.hasPassword);
    return {
        accessToken,
        refreshToken,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            twoFactorEnabled: user.twoFactorEnabled,
            isVerified: user.isVerified,
            hasPassword: !!user.password,
        },
    };
};
exports.handleGoogleCallback = handleGoogleCallback;
//# sourceMappingURL=oauth.service.js.map