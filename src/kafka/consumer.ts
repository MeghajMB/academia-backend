import { Kafka } from "kafkajs";
import { BidService } from "../services/bidService";
import { BidRepository } from "../repositories/bidRepository";
import { UserRepository } from "../repositories/userRepository";

const kafka = new Kafka({
  clientId: "server 1",
  brokers: ["localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "server-b-group" });

const bidService = new BidService(new BidRepository(), new UserRepository());
export async function runConsumer() {
  await consumer.connect();
  console.log("Consumer connected");

  // Subscribe to the topic
  await consumer.subscribe({ topics: ["bids"], fromBeginning: true });

  // Consume messages
  await consumer.run({
    eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
      const parsedMessage = JSON.parse(message.value?.toString() || "{}");
      const response=await bidService.placeBid(parsedMessage.data, parsedMessage.id);
      console.log(response);
    },
  });
}
