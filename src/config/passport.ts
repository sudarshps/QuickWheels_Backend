import passport from "passport";
import {
  Strategy as GoogleStrategy,
  VerifyCallback,
} from "passport-google-oauth2";

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser(function (user, done) {
  if (user) done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.AUTH_GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: `${process.env.BACKEND_URL}/auth/callback`,
      passReqToCallback: true,
    },
    function (
      request: any,
      accessToken: string,
      refreshToken: string,
      profile: any,
      done: VerifyCallback
    ) {  
      return done(null, profile);
    }
  )
);
