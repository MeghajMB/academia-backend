export interface RefreshTokenParams {
    refreshToken: string;
  }
  
  export interface RefreshTokenResponse {
    accessToken: string;
    id: string;
    role: string;
    name: string;
    email: string;
    refreshToken: string;
    verified: string;
    goldCoin: number;
    profilePicture: string;
  }
  
  export interface SignUpParams {
    name: string;
    email: string;
    password: string;
  }
  
  export interface SignUpResponse {
    message: "OTP send successfully";
  }
  
  export interface SaveUserParams {
    email: string;
    otp: string;
  }
  
  export interface SaveUserResponse {
    message: "User Created Successfully";
  }
  
  export interface SendOtpParams {
    email: string;
  }
  
  export interface SendOtpResponse {
    message: "OTP send successfully";
  }
  
  export interface ForgotUserPasswordParams {
    email: string;
  }
  
  export interface ForgotUserPasswordResponse {
    message: "OTP send successfully";
  }
  
  export interface VerifyResetOtpParams {
    email: string;
    otp: string;
  }
  
  export interface VerifyResetOtpResponse {
    resetToken: string;
  }
  
  export interface ResetPasswordParams {
    email: string;
    password: string;
    token: string;
  }
  
  export interface ResetPasswordResponse {
    message: "OTP send successfully";
  }
  
  export interface SignInParams {
    email: string;
    password: string;
  }
  
  export interface SignInResponse {
    accessToken: string;
    refreshToken: string;
    name: string;
    role: string;
    id: string;
    email: string;
    profilePicture:string;
    goldCoin:number;
    verified:string
  }
  
  export interface SignOutParams {
    refreshToken: string;
  }
  
  export interface SignOutResponse {
    message: "Success";
  }
  
  export interface RegisterInstructorParams {
    headline: string;
    biography: string;
    facebook: string;
    linkedin: string;
    twitter: string;
    website: string;
    agreement: boolean;
  }
  
  export interface CurrentUser {
    email: string;
    id: string;
    role: string;
  }
  
  export interface RegisterInstructorResponse {
    message: "Success";
  }