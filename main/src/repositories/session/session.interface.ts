import { SessionDocument } from "../../models/session.model";
import { IRepository } from "../base/base.interface";
import { GetUsersSessionsInput, GetUsersSessionsResult } from "./session.types";

export interface ISessionRepository  extends IRepository<SessionDocument> {
    getUserSessions(input: GetUsersSessionsInput):Promise<GetUsersSessionsResult[]|[]>
}