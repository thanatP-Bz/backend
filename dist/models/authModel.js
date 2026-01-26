"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const bcrypt_1 = __importDefault(require("bcrypt"));
const ApiError_1 = require("../utils/ApiError");
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: false },
    hasPassword: { type: Boolean },
    //verification email
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationTokenExpiry: { type: Date },
    //reset password
    resetPasswordToken: { type: String },
    resetPasswordExpiry: { type: Date },
    //reset token
    refreshToken: { type: String },
    refreshTokenExpiry: { type: Date },
    //2FA
    twoFactorSecret: { type: String },
    twoFactorEnabled: { type: Boolean, default: false },
    backupCodes: [{ type: String }],
    ////OAuth fields
    googleId: { type: String },
    githubId: { type: String },
    authProvider: {
        type: String,
        enum: ["local", "google", "github"],
        default: "local",
    },
    profilePicture: { type: String },
}, {
    timestamps: true,
});
userSchema.statics.checkEmail = async function (email) {
    const user = await this.findOne({ email });
    if (user) {
        throw new ApiError_1.ApiError("Email has been already in use!", 401);
    }
};
userSchema.statics.login = async function (email, password) {
    if (!email || !password) {
        throw new ApiError_1.ApiError("Email and password are required", 400);
    }
    const user = await this.findOne({ email });
    if (!user) {
        throw new ApiError_1.ApiError("Email Not Found", 400);
    }
    if (!user.isVerified) {
        throw new ApiError_1.ApiError("Please verify your email before logging in", 403);
    }
    const match = await bcrypt_1.default.compare(password, user.password);
    if (!match) {
        throw new ApiError_1.ApiError("Incorrect Password!", 400);
    }
    return user;
};
userSchema.pre("save", async function (next) {
    if (!this.password)
        return next();
    //if password is new or modified
    if (!this.isModified("password"))
        return next();
    const salt = await bcrypt_1.default.genSalt(10);
    this.password = await bcrypt_1.default.hash(this.password, salt);
});
exports.User = (0, mongoose_1.model)("User", userSchema);
//# sourceMappingURL=authModel.js.map