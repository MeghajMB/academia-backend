import jwt, { JwtPayload } from "jsonwebtoken";
import { BadRequestError } from "./errors/bad-request-error";

export class TokenManager {
  static generateAccessToken(payload: {
    id: string;
    email: string;
    role: string;
  }): string {
    return jwt.sign(payload, process.env.JWT_ACCESS_TOKEN_SECRET!, {
      expiresIn: "15m",
    });
  }

  static generateRefreshToken(payload: { id: string }): string {
    return jwt.sign(payload, process.env.JWT_REFRESH_TOKEN_SECRET!, {
      expiresIn: "1d",
    });
  }

  static generateResetToken(email: string): string {
    return jwt.sign(
      { email, purpose: "password-reset" },
      process.env.JWT_PASSWORD_RESET_SECRET!,
      {
        expiresIn: "5m",
      }
    );
  }

  static verifyRefreshToken(token: string): JwtPayload {
    const payload = jwt.verify(
      token,
      process.env.JWT_REFRESH_TOKEN_SECRET!
    ) as JwtPayload;
    if (!payload || !payload.id)
      throw new BadRequestError("Invalid refresh token");
    return payload;
  }

  static verifyResetToken(token: string, email: string): void {
    const decoded = jwt.verify(
      token,
      process.env.JWT_PASSWORD_RESET_SECRET!
    ) as { email: string };
    if (decoded.email !== email)
      throw new BadRequestError("Invalid reset token");
  }
}
