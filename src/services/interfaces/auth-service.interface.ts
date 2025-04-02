import {
  RefreshTokenParams,
  RefreshTokenResponse,
  SignUpParams,
  SignUpResponse,
  SaveUserParams,
  SaveUserResponse,
  SendOtpParams,
  SendOtpResponse,
  ForgotUserPasswordParams,
  ForgotUserPasswordResponse,
  VerifyResetOtpParams,
  VerifyResetOtpResponse,
  ResetPasswordParams,
  ResetPasswordResponse,
  SignInParams,
  SignInResponse,
  SignOutParams,
  SignOutResponse,
  RegisterInstructorParams,
  CurrentUser,
  RegisterInstructorResponse,
} from "../types/auth-service.types";

export interface IAuthService {
  refreshToken(params: RefreshTokenParams): Promise<RefreshTokenResponse>;
  signUp(params: SignUpParams): Promise<SignUpResponse>;
  saveUser(params: SaveUserParams): Promise<SaveUserResponse>;
  sendOtp(params: SendOtpParams): Promise<SendOtpResponse>;
  forgotUserPassword(
    params: ForgotUserPasswordParams
  ): Promise<ForgotUserPasswordResponse>;
  verifyResetOtp(params: VerifyResetOtpParams): Promise<VerifyResetOtpResponse>;
  resetPassword(params: ResetPasswordParams): Promise<ResetPasswordResponse>;
  signIn(params: SignInParams): Promise<SignInResponse>;
  signOut(params: SignOutParams): Promise<SignOutResponse>;
  registerInstructor(
    params: RegisterInstructorParams,
    currentUser: CurrentUser
  ): Promise<RegisterInstructorResponse>;
}
