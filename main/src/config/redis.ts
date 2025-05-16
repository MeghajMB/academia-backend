import config from "./configuration";

export const redisPubSubConfig = {
  host: config.redis.host || "127.0.0.1",
  port: Number(config.redis.port) || 6379,
  username: process.env.REDIS_USERNAME || undefined,
  password: process.env.REDIS_PASSWORD || undefined,
};
