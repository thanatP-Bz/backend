import Redis from "ioredis";

console.log(
  "🔍 REDIS_URL from env:",
  process.env.REDIS_URL ? "EXISTS" : "MISSING",
);
console.log(
  "🔍 REDIS_URL value:",
  process.env.REDIS_URL?.substring(0, 30) + "...",
);

// If REDIS_URL exists (production), use it with TLS config
if (process.env.REDIS_URL) {
  console.log("✅ Using REDIS_URL for connection");
  var redis = new Redis(process.env.REDIS_URL, {
    tls: {
      rejectUnauthorized: false,
    },
    maxRetriesPerRequest: 3,
    retryStrategy: (times: number): number | null => {
      if (times > 3) return null;
      return Math.min(times * 100, 1000);
    },
  });
} else {
  console.log("⚠️ REDIS_URL not found, using local config");
  const redisConfig: any = {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    retryStrategy: (times: number): number | void => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  };

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
