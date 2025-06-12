import { Queue, Worker } from "bullmq";
import { redis } from "../lib/redis";
import { container } from "../container";
import { Types } from "../container/types";
import { INotificationService } from "../services/notification/notification.interface";
import { ISessionService } from "../services/session/session.interface";

const sessionQueue = new Queue("sessionQueue", { connection: redis });

export async function scheduleSessionCompletion(
  sessionId: string,
  sessionEndTime: Date
) {
  await sessionQueue.add(
    "finalizeSession",
    { sessionId },
    { delay: Math.max(sessionEndTime.getTime() - Date.now(), 0) }
  );
}

const sessionWorker = new Worker(
  "sessionQueue",
  async (job) => {
    try {
      const sessionService = container.get<ISessionService>(
        Types.SessionService
      );
      const notificationService = container.get<INotificationService>(
        Types.NotificationService
      );
      const { sessionId } = job.data;
      console.log(`Finalizing session: ${sessionId}`);
      const users = await sessionService.finalizeSession(sessionId);
      await Promise.all(
        users.map((user) =>
          notificationService.sendNotification(
            user,
            "system",
            "Session Over",
            "The session has concluded.Go To Your Session for more details"
          )
        )
      );
    } catch (error) {
      console.error("Error finalizing session:", error);
    }
  },
  { connection: redis }
);

export { sessionQueue, sessionWorker };
