import Redis from "ioredis";
import config from "../config/configuration";

const redis = new Redis({
  host: config.redis.host || "127.0.0.1",
  port: Number(config.redis.port) || 6379, // Default Redis port
  maxRetriesPerRequest: null,
});

redis.on("connect", () => {
  console.log("Redis connected successfully");
});

redis.on("error", (err) => {
  console.error("Redis connection error:", err);
});
export { redis };
