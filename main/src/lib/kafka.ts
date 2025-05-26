import { Kafka } from "kafkajs";
import config from "../config/configuration";

const kafka = new Kafka({
  clientId: config.kafka.clientId,
  brokers: [config.kafka.broker],
});
export { kafka };
