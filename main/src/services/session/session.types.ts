import { Types } from "mongoose";

export interface GetSessionsOfUserParams{
    limit: number;
    status?: "scheduled" | "in-progress" | "completed" | "missed" | "all" | undefined;
    search?: string | undefined;
    page?: number | undefined;
}

export interface SessionDetails{
    id: string;
    sessionDate: string;
    sessionDuration: number;
    status: "scheduled" | "in-progress" | "completed" | "missed";
    description:string;
    instructor: {
        id: string;
        name: string;
    };
    gigId: string;
    sessionId: string;
    title: string;
}