import { Queue, Worker } from "bullmq";
import { redis } from "../lib/redis";
import { SessionService } from "../services/session/session.service";
import { NotificationService } from "../services/notification/notification.service";
import { NotificationRepository } from "../repositories/notification/notification.repository";
import { SessionRepository } from "../repositories/session/session.repository";

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

const sessionService = new SessionService(new SessionRepository());
const notificationService = new NotificationService(
  new NotificationRepository()
);
const sessionWorker = new Worker(
  "sessionQueue",
  async (job) => {
    try {
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
