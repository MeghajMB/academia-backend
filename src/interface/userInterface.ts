export interface IUser {
    name: string;
    email: string;
    password?: string;
    role?: string;
    phoneNo?: number;
    isBlocked?: boolean;
    profilePicture?: string;
    googleId?: string;
    id?:string
  }