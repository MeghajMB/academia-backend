export interface CustomJwtPayload {
    id: string;
    email: string;
    role:  "admin" | "student" | "instructor";
  }