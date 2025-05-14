import Razorpay from "razorpay";
import config from "../config/configuration";

const razorpay = new Razorpay({
  key_id: config.razorpay.keyId,
  key_secret: config.razorpay.keySecret,
});

export { razorpay };
