import { Producer } from "kafkajs";
import { kafka } from "../../lib/kafka";
import { RazorpayPaymentCapturedWebhook } from "../../types/razorpay";

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

export async function publishNewBids(message: {
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

export async function publishLectureToTranscode(message: {
  event: "add-lecture";
  data: {
    userId: string;
    courseId: string;
    sectionId: string;
    lectureId: string;
    key: string;
    bucketName: string;
  };
}) {
  const producer = await runProducer();
  await producer.send({
    topic: "lecture-uploaded",
    messages: [{ key: message.data.lectureId, value: JSON.stringify(message) }],
  });
}

export async function publishRazorPaySuccessPayment(message: {
  event: "payment-success";
  data: RazorpayPaymentCapturedWebhook;
}) {
  const producer = await runProducer();
  await producer.send({
    topic: "payment-razorpay-success",
    messages: [
      {
        key: message.data.payload.payment.entity.order_id,
        value: JSON.stringify(message),
      },
    ],
  });
}
