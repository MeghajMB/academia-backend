import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";

import passport from "passport";
import { UserRepository } from "../repositories/user/user.repository";
import config from "../config/configuration";

const userRepository = new UserRepository();
passport.use(
  new GoogleStrategy(
    {
      clientID:config.google.clientId,
      clientSecret:config.google.clientSecret,
      callbackURL: `${config.app.backendUrl}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {

        const { id, displayName, emails } = profile;
        const email = emails![0].value;
        const profilePicture=profile._json.picture

        let user = await userRepository.findByEmail(email);

        if (!user) {
          user = await userRepository.create({
            googleId: id,
            name: displayName,
            email,
            profilePicture
          });
        }

        const accessToken = jwt.sign(
          { id: user.id, email: user.email, role: user.role },
          process.env.JWT_ACCESS_TOKEN_SECRET!,
          { expiresIn: "15m" }
        );
        const refreshToken = jwt.sign(
          { id: user.id },
          process.env.JWT_REFRESH_TOKEN_SECRET!,
          { expiresIn: "1d" }
        );

        // Send the user data and JWT token
        done(null, { user, accessToken, refreshToken });
      } catch (error) {
        done(error, false);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user: { user: object; accessToken: string,refreshToken:string }, done) =>
  done(null, user)
);
