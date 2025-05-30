export type UserProfileResponse = {
  id: string;
  name: string;
  email: string;
  role: "student" | "instructor" | "admin"; // Adjust based on your enum
  phoneNo: number;
  isBlocked: boolean;
  purpleCoin: number;
  profilePicture: string;
  headline?: string | null;
  verified: "pending" | "rejected" | "notRequested" | "verified";
  biography?: string | null;
  links?: {
    facebook?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
} | undefined
  createdAt: string; // ISO string
};
