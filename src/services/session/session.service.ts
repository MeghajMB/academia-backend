import { ISessionRepository } from "../../repositories/session/session.interface";

export class SessionService {
  constructor(private sessionRepository: ISessionRepository) {}

  async finalizeSession(sessionId: string) {
    try {
      const session = await this.sessionRepository.findById(sessionId);
      if (!session) throw new Error("Session not found");
      const users:string[]=[]
      const updatedParticipants = session.participants.map((participant) => {
        let totalTime = 0;
        users.push(participant.userId.toString())
        for (let i = 0; i < participant.joinTimes.length; i++) {
          const joinTime = participant.joinTimes[i];
          const leaveTime = participant.leaveTimes[i] || new Date(); // Fallback to now if missing

          totalTime += Math.floor(
            (leaveTime.getTime() - joinTime.getTime()) / 1000
          );
        }

        return { ...participant, totalTimeSpent: totalTime };
      });

      await this.sessionRepository.update(sessionId, {
        participants: updatedParticipants,
        status: "completed",
      },{});
      return users
    } catch (error) {
      throw error;
    }
  }
}
