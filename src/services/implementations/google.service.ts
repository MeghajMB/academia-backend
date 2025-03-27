import passport from "passport";
import { Response, Request } from "express";
import { IUser } from "../../types/user.interface";
import { redis } from "../../lib/redis";

export const authenticateGoogle = passport.authenticate("google", {
  scope: ["profile", "email"],
});

export const googleCallback = passport.authenticate("google", {
  session: false,
  failureRedirect: `${process.env.CLIENT_URL}/login`,
});

export const googleController = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(400).json({ error: "Authentication failed" });
    return;
  }
  const { user, accessToken, refreshToken } = req.user as {
    user: IUser;
    accessToken: string;
    refreshToken: string;
  };
  const { name, role, id, goldCoin, email, profilePicture, verified } = user;

  await redis.set(`refreshToken:${user.id}`, refreshToken, "EX", 60 * 60 * 24);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.send(`
    <script>
      window.opener.postMessage({ accessToken: '${accessToken}',name: '${name}',role:'${role}' ,id:'${id}',email:'${email}',profilePicture:'${profilePicture}',goldCoin:'${goldCoin}',verified:'${verified}' }, "${process.env.CLIENT_URL}");
      window.close();
    </script>
  `);
};
