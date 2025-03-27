import { ISessionDocument, SessionModel } from "../../models/session.model";
import { BaseRepository } from "../base/base.repository";


export class SessionRepository extends BaseRepository<ISessionDocument> {
  //implements ISessionRepository
  constructor() {
    super(SessionModel);
  }
}
