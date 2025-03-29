import Redis from "ioredis";
import { redisPubSubConfig } from "../config/redis";

class RedisPubSub {
  public pub: Redis;
  public sub: Redis;

  constructor() {
    this.pub = new Redis(redisPubSubConfig);

    this.sub = new Redis(redisPubSubConfig);

    this.pub.on("connect", () => console.log("Redis Publisher connected"));
    this.sub.on("connect", () => console.log("Redis Subscriber connected"));

    this.sub.on("error", (err) =>
      console.error("Redis Subscriber Error:", err)
    );
    this.pub.on("error", (err) => console.error("Redis Publisher Error:", err));
  }
}

export const redisPubSub = new RedisPubSub();
