import { Queue, Worker } from "bullmq";
import { redis } from "../lib/redis";

import { container } from "../container";
import { INotificationService } from "../services/notification/notification.interface";
import { Types } from "../container/types";

// Create a queue for scheduled tasks
const sessionNotificationQueue = new Queue("sessionNotificationQueue", {
  connection: redis,
});
// Function to schedule auction closing
export async function scheduleSessionNotification(
  users: string[],
  notificationTime: Date
) {
  await sessionNotificationQueue.add(
    "sessionNotification",
    { users },
    { delay: Math.max(notificationTime.getTime() - Date.now(), 0) } // Delay execution until auction ends
  );
}

// Worker to process auction closing jobs
const sessionNotificationWorker = new Worker(
  "sessionNotificationQueue",
  async (job) => {
    try {
    const { users } = job.data;
    console.log(`Sendong notifications to users about session`);
      const notificationService = container.get<INotificationService>(
        Types.NotificationService
      );
      await Promise.all(
        users.map((user: string) =>
          notificationService.sendNotification(
            user,
            "system",
            "Session Starting",
            "Your Session is about to start.Join fast."
          )
        )
      );
    } catch (error) {
      console.log(error);
    }
  },
  { connection: redis }
);

export { sessionNotificationQueue, sessionNotificationWorker };
