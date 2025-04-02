import { SessionDocument, SessionModel } from "../../models/session.model";
import { BaseRepository } from "../base/base.repository";


export class SessionRepository extends BaseRepository<SessionDocument> {
  //implements ISessionRepository
  constructor() {
    super(SessionModel);
  }
}
