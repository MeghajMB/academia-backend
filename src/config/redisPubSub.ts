import Redis from "ioredis";

class RedisPubSub {
  public pub: Redis;
  public sub: Redis;

  constructor() {
    this.pub = new Redis({
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: Number(process.env.REDIS_PORT) || 6379,
      username: process.env.REDIS_USERNAME || undefined,
      password: process.env.REDIS_PASSWORD || undefined,
    });

    this.sub = new Redis({
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: Number(process.env.REDIS_PORT) || 6379,
      username: process.env.REDIS_USERNAME || undefined,
      password: process.env.REDIS_PASSWORD || undefined,
    });

    this.pub.on("connect", () => console.log("Redis Publisher connected"));
    this.sub.on("connect", () => console.log("Redis Subscriber connected"));

    this.sub.on("error", (err) =>
      console.error("Redis Subscriber Error:", err)
    );
    this.pub.on("error", (err) =>
      console.error("Redis Publisher Error:", err)
    );
  }
}

export const redisPubSub = new RedisPubSub();
