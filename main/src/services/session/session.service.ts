import { inject, injectable } from "inversify";
import { ISessionRepository } from "../../repositories/session/session.interface";
import { ISessionService } from "./session.interface";
import { GetSessionsOfUserParams, SessionDetails } from "./session.types";
import { Types } from "../../container/types";

@injectable()
export class SessionService implements ISessionService {
  constructor(
    @inject(Types.SessionRepository)
    private readonly sessionRepository: ISessionRepository
  ) {}
  async getSessionsOfUser(
    payload: GetSessionsOfUserParams,
    userId: string
  ): Promise<any> {
    try {
      const response = await this.sessionRepository.getUserSessions({
        ...payload,
        userId,
      });
      const totalDocuments = 5;
      let updatedSessionDetails: SessionDetails[] | [] = [];
      if (response.length > 0) {
        updatedSessionDetails = response.map((session) => {
          return {
            id: session._id.toString(),
            sessionDate: session.sessionDate.toISOString(),
            sessionDuration: session.sessionDuration,
            status: session.status,
            description: session.description,
            instructor: {
              id: session.instructor.id.toString(),
              name: session.instructor.name,
            },
            gigId: session.gigId.toString(),
            sessionId: session.sessionId.toString(),
            title: session.title,
          };
        });
      }
      const pagination = {
        totalDocuments: totalDocuments,
        totalPages: Math.ceil(totalDocuments / payload.limit),
        currentPage: 1,
        limit: payload.limit,
      };
      return { sessionDetails: updatedSessionDetails, pagination };
    } catch (error) {
      throw error;
    }
  }

  async finalizeSession(sessionId: string): Promise<string[]> {
    try {
      const session = await this.sessionRepository.findById(sessionId);
      if (!session) throw new Error("Session not found");
      const users: string[] = [];
      const updatedParticipants = session.participants.map((participant) => {
        let totalTime = 0;
        users.push(participant.userId.toString());
        for (let i = 0; i < participant.joinTimes.length; i++) {
          const joinTime = participant.joinTimes[i];
          const leaveTime = participant.leaveTimes[i] || new Date(); // Fallback to now if missing

          totalTime += Math.floor(
            (leaveTime.getTime() - joinTime.getTime()) / 1000
          );
        }

        return { ...participant, totalTimeSpent: totalTime };
      });

      await this.sessionRepository.update(
        sessionId,
        {
          participants: updatedParticipants,
          status: "completed",
        },
        {}
      );
      return users;
    } catch (error) {
      throw error;
    }
  }
}
