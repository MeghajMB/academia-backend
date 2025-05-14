import { Queue, Worker } from "bullmq";
import { redis } from "../lib/redis";

import { NotificationService } from "../services/notification/notification.service";
import { NotificationRepository } from "../repositories/notification/notification.repository";
import { Types } from "mongoose";

//dependency injection
const notificationService = new NotificationService(
  new NotificationRepository()
);

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
    const { users } = job.data;
    console.log(`Sendong notifications to users about session`);
    try {
      await Promise.all(
        users.map((user: { id: Types.ObjectId; session: Types.ObjectId }) =>
          notificationService.sendNotification(
            user.id.toString(),
            "system",
            "Session Starting",
            "Your Session is about to start.Join fast.",
            user.session.toString()
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
