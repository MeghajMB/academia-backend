import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";

import passport from "passport";
import config from "../config/configuration";
import mongoose from "mongoose";
import { container } from "../container";
import { Types } from "../container/types";
import { IWalletRepository } from "../repositories/wallet/wallet.interface";
import { IUserRepository } from "../repositories/user/user.interface";

const userRepository = container.get<IUserRepository>(Types.UserRepository);
const walletRepository = container.get<IWalletRepository>(
  Types.WalletRepository
);

passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackURL: `${config.app.backendUrl}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { id, displayName, emails } = profile;
        const email = emails![0].value;
        const profilePicture = profile._json.picture;

        let user = await userRepository.findByEmail(email);

        if (!user) {
          const session = await mongoose.startSession();
          session.startTransaction();
          try {
            user = await userRepository.createUserWithSession(
              {
                googleId: id,
                name: displayName,
                email,
                profilePicture,
              },
              session
            );
            const wallet = await walletRepository.createWallet(
              user._id,
              session
            );
            await session.commitTransaction();
          } catch (error) {
            await session.abortTransaction();
            throw error;
          } finally {
            session.endSession();
          }
        }

        const accessToken = jwt.sign(
          { id: user.id, email: user.email, role: user.role },
          config.jwt.accessTokenSecret,
          { expiresIn: "15m" }
        );

        const refreshToken = jwt.sign(
          { id: user.id },
          config.jwt.refreshTokenSecret,
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
passport.deserializeUser(
  (user: { user: object; accessToken: string; refreshToken: string }, done) =>
    done(null, user)
);
