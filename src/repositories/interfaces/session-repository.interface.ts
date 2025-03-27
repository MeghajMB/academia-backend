import { ISessionDocument } from "../../models/session.model";
import { IRepository } from "../base/base-repository.interface";

export interface ISessionRepository  extends IRepository<ISessionDocument> {}