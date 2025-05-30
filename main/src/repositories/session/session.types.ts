import { Types } from "mongoose";

export interface GetUsersSessionsInput {
  limit: number;
  status?: "scheduled" | "in-progress" | "completed" | "missed" | "all";
  search?: string;
  page?: number;
  userId: string;
}
export interface GetUsersSessionsResult {
  _id:Types.ObjectId
  sessionDate:Date;
  gigId: Types.ObjectId;
  sessionId: Types.ObjectId;
  description:string
  instructor: { id: Types.ObjectId; name: string };
  title: string;
  sessionDuration: number;
  status: "scheduled" | "in-progress" | "completed" | "missed";
}

export interface SessionAnalyticsResult {
  date: string;
  sessionCount: number;
}
