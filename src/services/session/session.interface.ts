import { GetSessionsOfUserParams } from "./session.types";

export interface ISessionService {
  finalizeSession(sessionId: string): Promise<string[]>;
  getSessionsOfUser(
    payload: GetSessionsOfUserParams,
    userId: string
  ): Promise<any>;
}
