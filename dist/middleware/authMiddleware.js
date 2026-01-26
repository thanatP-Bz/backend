"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authModel_1 = require("../models/authModel");
const ApiError_1 = require("../utils/ApiError");
const session_service_1 = require("../services/session.service");
const requireAuth = async (req, res, next) => {
    const token = req.cookies.accessToken;
    const sessionId = req.cookies.sessionId;
    if (!token) {
        throw new ApiError_1.ApiError("Token missing", 401);
    }
    if (!sessionId) {
        throw new ApiError_1.ApiError("Session is missing", 401);
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_ACCESS_SECRET);
        if (!decoded._id) {
            console.log("❌ No _id in decoded token");
            throw new ApiError_1.ApiError("Invalid token payload", 401);
        }
        //check session Valid
        const sessionValid = await (0, session_service_1.isSessionValid)(sessionId);
        if (!sessionValid) {
            console.log("session expired or invalid");
            throw new ApiError_1.ApiError("Session expired, please login again", 401);
        }
        const user = await authModel_1.User.findById(decoded._id).select("_id name email");
        console.log("6. User found:", user ? user.email : "NOT FOUND");
        if (!user) {
            throw new ApiError_1.ApiError("User not found", 404);
        }
        //update session activity
        await (0, session_service_1.updateSessionActivity)(sessionId);
        req.user = user;
        console.log("✅ Auth successful!");
        next();
    }
    catch (error) {
        console.log("❌ Error:", error.message);
        throw new ApiError_1.ApiError("Request is not authorized", 401);
    }
};
exports.requireAuth = requireAuth;
//# sourceMappingURL=authMiddleware.js.map