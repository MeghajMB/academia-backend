import { container } from "../../../container";
import { Types } from "../../../container/types";
import { kafka } from "../../../lib/kafka";
import { RazorpayPaymentCapturedWebhook } from "../../../types/razorpay";
import { IPaymentService } from "../../../services/payment/payment.interface";

const consumer = kafka.consumer({ groupId: "payment-group" });

export async function paymentSuccessConsumer() {
  await consumer.connect();
  console.log("Consumer connected");

  // Subscribe to the topic
  await consumer.subscribe({
    topics: ["payment-razorpay-success"],
    fromBeginning: true,
  });
  // intialize payment service
  const paymentService = container.get<IPaymentService>(Types.PaymentService);
  // Consume messages
  await consumer.run({
    eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
      try {
        const parsedMessage = JSON.parse(message.value?.toString() || "{}") as {
          event: "payment-success";
          data: RazorpayPaymentCapturedWebhook;
        };

        await paymentService.handlePaymentSuccessWithRazorpayWebhook(
          parsedMessage.data
        );
      } catch (error) {
        console.log(error);
        pause(); // Pause the consumer on errors
        setTimeout(() => consumer.resume([{ topic }]), 1000);
      }
    },
  });
}
