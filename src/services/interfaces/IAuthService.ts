import { IUserResult } from "../../types/user.interface";

export interface IAuthService {
  refreshToken(token: string): Promise<{
    accessToken: string;
    id: string;
    role: string;
    name: string;
    email: string;
    refreshToken: string;
    verified: string;
  } | null>;

  signUp(name: string, email: string, password: string): Promise<boolean>;

  saveUser(otp: string, email: string): Promise<{ message: string }>;

  sendOtp(email: string): Promise<boolean>;

  forgotUserPassword(email: string): Promise<boolean>;

  verifyResetOtp(email: string, otp: string): Promise<string>;

  resetPassword(
    data: { email: string; newPassword: string },
    token: string
  ): Promise<void>;

  signIn(
    email: string,
    password: string
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    name: string;
    role: string;
    id: string;
    userEmail: string;
  }>;

  signOut(refreshToken: string): Promise<boolean>;

  registerInstructor(
    data: {
      headline: string;
      biography: string;
      facebook: string;
      linkedin: string;
      twitter: string;
      website: string;
      agreement: boolean;
    },
    currentUser: { email: string; id: string; role: string }
  ): Promise<IUserResult>;
}
