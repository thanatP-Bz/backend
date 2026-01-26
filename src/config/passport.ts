import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/authModel";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!, // Fixed typo: GOOOLE → GOOGLE
      callbackURL: process.env.GOOGLE_CALLBACK_URL!, // Fixed typo: callBackURL → callbackURL, GOOOLE_CLIENT_URL → GOOGLE_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        //check user
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          //return user
          return done(null, user);
        }

        const existEmailUser = await User.findOne({
          email: profile.emails?.[0]?.value,
        });

        if (existEmailUser) {
          existEmailUser.googleId = profile.id;
          existEmailUser.profilePicture = profile.photos?.[0]?.value || ""; // Fixed: photo → photos
          await existEmailUser.save();
          return done(null, existEmailUser);
        }

        user = await User.create({
          googleId: profile.id,
          email: profile.emails?.[0]?.value, // Fixed: photo → emails
          name: profile.displayName,
          profilePicture: profile.photos?.[0]?.value, // Fixed: photo → photos
          authProvider: "google",
          isVerified: true,
          twoFactorEnabled: false,
        });

        return done(null, user);
      } catch (error) {
        return done(error as Error, false);
      }
    },
  ),
);

export default passport;
