import Redis from "ioredis";

const redisConfig: any = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  retryStrategy: (times: number): number | void => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
};

// Only add password if it exists
if (process.env.REDIS_PASSWORD) {
  redisConfig.password = process.env.REDIS_PASSWORD;
}

const redis = new Redis(redisConfig);

redis.on("connect", () => {
  console.log("✅ Connected to Redis");
});

redis.on("error", (err: Error) => {
  console.error("❌ Redis error:", err);
});

export default redis;
