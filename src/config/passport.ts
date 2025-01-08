import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/userRepository";
import passport from "passport";

const userRepository = new UserRepository();
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log(profile);

        const { id, displayName, emails } = profile;
        const email = emails![0].value;
        const profilePicture=profile._json.picture

        let user = await userRepository.findByEmail(email);

        if (!user) {
          user = await userRepository.createUser({
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
