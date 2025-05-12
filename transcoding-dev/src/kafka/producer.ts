import { LectureMessage } from "../types/types";
import { Kafka, Producer } from "kafkajs";

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID,
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
});

let Kafkaproducer: Producer | null = null;

export async function runProducer() {
  if (Kafkaproducer) {
    return Kafkaproducer;
  }
  try {
    const producer = kafka.producer();
    await producer.connect();
    console.log("Producer Connected");
    Kafkaproducer = producer;
    return Kafkaproducer;
  } catch (error) {
    console.error("Failed to connect Kafka producer:", error);
    throw new Error(`Kafka producer connection failed`);
  }
}

export async function produceLectureEvent(message: LectureMessage) {
  const producer = await runProducer();
  await producer.send({
    topic: "lecture-transcoded",
    messages: [
      {
        key: message.data.lectureId,
        value: JSON.stringify(message),
      },
    ],
  });
}
