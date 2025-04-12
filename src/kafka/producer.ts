import { Kafka, Producer } from "kafkajs";

const kafka = new Kafka({
  clientId: "server 1",
  brokers: ["localhost:9092"],
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

export async function produceMessage(message: {
  data: { gigId: string; bidAmt: number };
  id: string;
}) {
  const producer = await runProducer();
  await producer.send({
    topic: "bids",
    messages: [
      {
        key: message.data.gigId,
        value: JSON.stringify(message),
      },
    ],
  });
}
