import { Kafka } from "kafkajs";
import { MessageBody } from "../types/types";
import { transcode } from "../services/transcode.service";

const CONCURRENCY_LIMIT = 3;
const MAX_RETRIES = 3;
let currentProcessing = 0;
let isPaused = false;

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID,
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "transcoder-group" });

export async function lectureConsumer() {
  await consumer.connect();
  console.log("consumer connected");

  await consumer.subscribe({
    topics: ["lecture-uploaded"],
    fromBeginning: true,
  });

  await consumer.run({
    autoCommit: false,
    eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
      // Send heartbeat to keep session alive
      const heartbeatInterval = setInterval(async () => {
        try {
          await heartbeat();
        } catch (err) {
          console.warn("Heartbeat failed:", err);
        }
      }, 10000);

      try {
        if (currentProcessing >= CONCURRENCY_LIMIT) {
          if (!isPaused) {
            console.log("Pausing consumer...");
            consumer.pause([{ topic }]);
            isPaused = true;
          }
          return; // Skip until slots free
        }
        currentProcessing++;

        const parsed = JSON.parse(message.value!.toString()) as MessageBody;
        await transcode(parsed);
        currentProcessing--;

        await consumer.commitOffsets([
          {
            topic,
            partition,
            offset: (parseInt(message.offset) + 1).toString(), // Commit the next offset
          },
        ]);
      } catch (error) {
        throw error;
      } finally {
        // If paused and now we have free slots, resume
        if (isPaused && currentProcessing < CONCURRENCY_LIMIT) {
          console.log("Resuming consumer...");
          consumer.resume([{ topic }]);
          isPaused = false;
        }
        clearInterval(heartbeatInterval);
      }
    },
  });
}
