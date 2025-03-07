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
  const producer = kafka.producer();
  await producer.connect();
  console.log("Producer Connected");
  Kafkaproducer = producer;
  return Kafkaproducer
}

export async function produceMessage(message:{ data: { gigId:string, bidAmt:number }, id:string }, correlationId:string) {
  const producer = await runProducer();
  await producer.send({
    topic: "bids",
    messages: [
      {
        key: correlationId,
        value: JSON.stringify(message),
      },
    ],
  });
}
