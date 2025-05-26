import { bidConsumer } from "./modules/bid.consumer";
import { lectureUploadedConsumer } from "./modules/lecture-upload.consumer";
import { paymentSuccessConsumer } from "./modules/payment-capture.consumer";

export async function runConsumers() {
  await Promise.all([
    bidConsumer(),
    lectureUploadedConsumer(),
    paymentSuccessConsumer(),
  ]);
}
