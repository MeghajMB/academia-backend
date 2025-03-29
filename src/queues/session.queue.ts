import { Queue, Worker } from "bullmq";
import { redis } from "../lib/redis";
import { SessionService } from "../services/implementations/session.service";
import { NotificationService } from "../services/implementations/notification.service";
import { NotificationRepository } from "../repositories/implementations/notification.repository";
import { SessionRepository } from "../repositories/implementations/session.repository";

const sessionQueue = new Queue("sessionQueue", { connection: redis });

export async function scheduleSessionCompletion(
  sessionId: string,
  sessionDuration: number
) {
  await sessionQueue.add(
    "finalizeSession",
    { sessionId },
    { delay: sessionDuration * 60 * 1000 } // Convert minutes to milliseconds
  );
}

const sessionService = new SessionService(new SessionRepository());
const notificationService = new NotificationService(
  new NotificationRepository()
);
const sessionWorker = new Worker(
  "sessionQueue",
  async (job) => {
    const { sessionId } = job.data;
    console.log(`Finalizing session: ${sessionId}`);
    try {
      const users = await sessionService.finalizeSession(sessionId);
      await Promise.all(
        users.map((user) =>
          notificationService.sendNotification(
            user,
            "system",
            "Session Over",
            "The session has concluded.Go To Your Bids for more details"
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
