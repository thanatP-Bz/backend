"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const authModel_1 = require("../models/authModel");
console.log("🔍 Google OAuth Config:");
console.log("Client ID:", process.env.GOOGLE_CLIENT_ID);
console.log("Callback URL:", process.env.GOOGLE_CALLBACK_URL);
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Fixed typo: GOOOLE → GOOGLE
    callbackURL: process.env.GOOGLE_CALLBACK_URL, // Fixed typo: callBackURL → callbackURL, GOOOLE_CLIENT_URL → GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
    try {
        //check user
        let user = await authModel_1.User.findOne({ googleId: profile.id });
        if (user) {
            //return user
            return done(null, user);
        }
        const existEmailUser = await authModel_1.User.findOne({
            email: profile.emails?.[0]?.value,
        });
        if (existEmailUser) {
            existEmailUser.googleId = profile.id;
            existEmailUser.profilePicture = profile.photos?.[0]?.value || ""; // Fixed: photo → photos
            await existEmailUser.save();
            return done(null, existEmailUser);
        }
        user = await authModel_1.User.create({
            googleId: profile.id,
            email: profile.emails?.[0]?.value, // Fixed: photo → emails
            name: profile.displayName,
            profilePicture: profile.photos?.[0]?.value, // Fixed: photo → photos
            authProvider: "google",
            isVerified: true,
            twoFactorEnabled: false,
        });
        return done(null, user);
    }
    catch (error) {
        return done(error, false);
    }
}));
exports.default = passport_1.default;
//# sourceMappingURL=passport.js.map