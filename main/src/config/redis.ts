import config from "./configuration";

export const redisPubSubConfig = {
  host: config.redis.host || "127.0.0.1",
  port: Number(config.redis.port) || 6379,
};
