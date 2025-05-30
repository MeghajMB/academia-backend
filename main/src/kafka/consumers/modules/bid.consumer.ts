import { redis } from "../../../lib/redis";
import { container } from "../../../container";
import { IBidService } from "../../../services/bid/bid.interface";
import { Types } from "../../../container/types";
import { kafka } from "../../../lib/kafka";

const consumer = kafka.consumer({ groupId: "bid-group" });

export async function bidConsumer() {
  await consumer.connect();
  console.log("Consumer connected");

  // Subscribe to the topic
  await consumer.subscribe({ topics: ["bids"], fromBeginning: true });
  //intialize the service
  const bidService = container.get<IBidService>(Types.BidService);
  // Consume messages
  await consumer.run({
    eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
      const parsedMessage = JSON.parse(message.value?.toString() || "{}");
      const gigId = parsedMessage.data.gigId;
      try {
        await redis.incr(`pendingBids:${gigId}`);
        const response = await bidService.createBid(
          parsedMessage.data,
          parsedMessage.id
        );
        console.log(response);
      } catch (error) {
        console.log(error);
        pause(); // Pause the consumer on errors
        setTimeout(() => consumer.resume([{ topic }]), 1000);
      } finally {
        await redis.decr(`pendingBids:${gigId}`);
      }
    },
  });
}

// Function to check if there are pending bids for a specific auction
export async function areBidsStillProcessing(gigId: string): Promise<boolean> {
  const count = await redis.get(`pendingBids:${gigId}`);
  return count !== null && parseInt(count) > 0;
}
