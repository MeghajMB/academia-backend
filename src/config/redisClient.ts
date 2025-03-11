import Redis from "ioredis";

const redis = new Redis({
  host: "localhost",
  port: 6379, // Default Redis port
  maxRetriesPerRequest: null, 
});

redis.on("connect", () => {
  console.log("Redis connected successfully");
});

redis.on("error", (err) => {
  console.error("Redis connection error:", err);
});
export { redis };
