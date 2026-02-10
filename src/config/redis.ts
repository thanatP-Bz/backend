import Redis from "ioredis";

// If REDIS_URL exists (production), use it directly
if (process.env.REDIS_URL) {
  var redis = new Redis(process.env.REDIS_URL);
} else {
  // Otherwise use individual config (local development)
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

  var redis = new Redis(redisConfig);
}

redis.on("connect", () => {
  console.log("✅ Connected to Redis");
});

redis.on("error", (err: Error) => {
  console.error("❌ Redis error:", err);
});

export default redis;
