import Redis from "ioredis";
import { redisConfig } from "../config/redis";

const redis = new Redis(redisConfig);

redis.on("connect", () => {
  console.log("Redis connected successfully");
});

redis.on("error", (err) => {
  console.error("Redis connection error:", err);
});
export { redis };
