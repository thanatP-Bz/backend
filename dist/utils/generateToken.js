"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Generate Access Token
const generateAccessToken = (userId) => {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
        throw new Error("JWT_ACCESS_SECRET is not defined! Check your .env file");
    }
    return jsonwebtoken_1.default.sign({ _id: userId }, secret, {
        expiresIn: "15min",
    });
};
exports.generateAccessToken = generateAccessToken;
// Generate Refresh Token
const generateRefreshToken = (userId) => {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
        throw new Error("JWT_REFRESH_SECRET is not defined! Check your .env file");
    }
    return jsonwebtoken_1.default.sign({ _id: userId }, secret, {
        expiresIn: "7d",
    });
};
exports.generateRefreshToken = generateRefreshToken;
// Verify Access Token
const verifyAccessToken = (token) => {
    try {
        const secret = process.env.JWT_ACCESS_SECRET;
        if (!secret)
            return null;
        return jsonwebtoken_1.default.verify(token, secret);
    }
    catch (error) {
        return null;
    }
};
exports.verifyAccessToken = verifyAccessToken;
// Verify Refresh Token
const verifyRefreshToken = (token) => {
    try {
        const secret = process.env.JWT_REFRESH_SECRET;
        if (!secret) {
            return null;
        }
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        console.log("✅ Token verified successfully:", decoded);
        return decoded;
    }
    catch (error) {
        return null;
    }
};
exports.verifyRefreshToken = verifyRefreshToken;
//# sourceMappingURL=generateToken.js.map