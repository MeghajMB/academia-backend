import { SessionDocument } from "../../models/session.model";
import { IRepository } from "../base/base.interface";

export interface ISessionRepository  extends IRepository<SessionDocument> {}