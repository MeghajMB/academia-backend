import { Queue, Worker } from "bullmq";
import { redis } from "../config/redisClient";
import { GigRepository } from "../repositories/gigRepository";
import { areBidsStillProcessing } from "../kafka/consumer";

// Create a queue for scheduled tasks
const auctionQueue = new Queue("auctionQueue", { connection: redis });
const gigRepository = new GigRepository();
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
      await gigRepository.update(gigId, { status: status });
      //do the necessary updates
      //send notification

      await redis.del(`pendingBids:${gigId}`);
    } catch (error) {
      console.log(error);
    }
  },
  { connection: redis }
);

export { auctionQueue, auctionWorker };
