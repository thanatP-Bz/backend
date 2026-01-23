import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import {User} from '../models/authModel'

passport.use(
    new GoogleStrategy(
clientID: process.env.GOOGLE_CLIENT_ID!,

    ), async() => {
        try {
            
        } catch (error) {
            
        }
    }
)