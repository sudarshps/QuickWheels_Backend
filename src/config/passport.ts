import passport from 'passport';
import { Strategy as GoogleStrategy, VerifyCallback } from 'passport-google-oauth2';
import dotenv from 'dotenv'


dotenv.config()


interface User {
    id?: string;
    email?: string;
    displayName?: string;
}

passport.serializeUser((user: User, done: (err: any, id?: any) => void) => {
    done(null, user);
});

passport.deserializeUser((user: User, done: (err: any, id?: any) => void) => {
    done(null, user);
});

passport.use(new GoogleStrategy({
    clientID: process.env.AUTH_GOOGLE_CLIENT_ID as string, 
    clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET as string,
    callbackURL: "http://localhost:3000/auth/callback",
    passReqToCallback: true
  },
  function(request: any, accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
    return done(null, profile);
  }
));


export default passport