import { SessionDocument } from "../../models/session.model";
import { IRepository } from "../base/base.interface";
import {
  GetUsersSessionsInput,
  GetUsersSessionsResult,
  SessionAnalyticsResult,
} from "./session.types";

export interface ISessionRepository extends IRepository<SessionDocument> {
  getUserSessions(
    input: GetUsersSessionsInput
  ): Promise<GetUsersSessionsResult[] | []>;
  fetchAdminSessionAnalytics(
    matchStage: Record<string, any>,
    dateGroup: "daily" | "monthly" | "yearly"
  ): Promise<{
    metrics: SessionAnalyticsResult[];
    summary: {
      sessionCount: number;
    };
  }>;
}
