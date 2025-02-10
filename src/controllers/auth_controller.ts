import { Request, Response, NextFunction } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import "../config/passport";

class AuthController {
  constructor() {}

  authenticateUser(req: Request, res: Response, next: NextFunction): void {
    passport.authenticate("google", { scope: ["email", "profile"] })(req, res, next);
  }

  handleCallback(req: Request, res: Response, next: NextFunction): void {
    passport.authenticate("google", { session: false }, async (err:any, user:any) => {
      if (err || !user) {
        return res.redirect("/auth/callback/failure");
      }

      const { email, displayName } = user as { email: string; displayName: string };
      const secret = process.env.JWT_GAUTH_SECRET as string;

      const token = jwt.sign(
        { email, username: displayName },
        secret,
        { expiresIn: "1h" }
      );

      res.cookie("auth_token", token, {
        maxAge: 3600000,
        // httpOnly: true,
        secure: true,
        sameSite: "none",
      });

      res.redirect(`${process.env.FRONTEND_URL}/login`);
    })(req, res, next);
  }

  handleFailure(req: Request, res: Response): void {
    console.log("failed");
    res.status(401).json({ message: "Authentication failed" });
  }
}

export default new AuthController();


  