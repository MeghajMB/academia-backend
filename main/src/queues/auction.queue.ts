import { Queue, Worker } from "bullmq";
import { redis } from "../lib/redis";

import { areBidsStillProcessing } from "../kafka/consumers/modules/bid.consumer";
import { scheduleSessionCompletion } from "./session.queue";

import { NotificationService } from "../services/notification/notification.service";
import { GigRepository } from "../repositories/gig/gig.repository";
import { SessionRepository } from "../repositories/session/session.repository";
import { NotificationRepository } from "../repositories/notification/notification.repository";
import { scheduleSessionNotification } from "./session-notification.queue";

//dependency injection
const gigRepository = new GigRepository();
const sessionRepository = new SessionRepository();
const notificationService = new NotificationService(
  new NotificationRepository()
);

// Create a queue for scheduled tasks
const auctionQueue = new Queue("auctionQueue", { connection: redis });
// Function to schedule auction closing
export async function scheduleAuctionClose(
  gigId: string,
  biddingExpiresAt: Date
) {
  await auctionQueue.add(
    "closeAuction",
    { gigId },
    { delay: Math.max(biddingExpiresAt.getTime() - Date.now(), 0) } // Delay execution until auction ends
  );
}

async function waitForKafkaBids(gigId: string) {
  while (await areBidsStillProcessing(gigId)) {
    console.log(`Waiting for bids to be processed for auction: ${gigId}...`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

// Worker to process auction closing jobs
const auctionWorker = new Worker(
  "auctionQueue",
  async (job) => {
    const { gigId } = job.data;
    console.log(`Closing auction for gig: ${gigId}`);
    try {
      await waitForKafkaBids(gigId);
      const gig = await gigRepository.findById(gigId);
      if (!gig || gig.status !== "active") {
        console.log(`Gig ${gigId} already processed or not found`);
        return;
      }
      let status: "active" | "completed" | "expired" | "missed" | "no-bids";
      if (gig.currentBidder) {
        status = "expired";
      } else {
        status = "no-bids";
      }
      await gigRepository.update(gigId, { status: status }, {});
      if (gig.currentBidder) {
        //do the necessary updates
        const participants = [
          {
            userId: gig.currentBidder,
            joinTimes: [],
            leaveTimes: [],
            totalTimeSpent: 0,
          },
        ];

        const session = await sessionRepository.create({
          gigId: gigId,
          instructorId: gig.instructorId,
          sessionDate: gig.sessionDate,
          sessionDuration: gig.sessionDuration,
          participants: participants,
        });
        //calculete the session ending time for finalizing the session
        const sessionEndTime = new Date(
          gig.sessionDate.getTime() + gig.sessionDuration * 60_000
        );
        await scheduleSessionCompletion(session.id, sessionEndTime);
        await Promise.all(
          participants.map((participant) =>
            notificationService.sendNotification(
              participant.userId.toString(),
              "system",
              "Bid Successful",
              "You have won the bid. Go to Your bids for more details.",
              session.id
            )
          )
        );
        const users = participants.map((user) => user.userId.toString());
        scheduleSessionNotification(
          users,
          new Date(new Date(gig.sessionDate).getTime() - 1 * 1 * 1000)
        );
      }

      await redis.del(`pendingBids:${gigId}`);
    } catch (error) {
      console.log(error);
    }
  },
  { connection: redis }
);

export { auctionQueue, auctionWorker };
