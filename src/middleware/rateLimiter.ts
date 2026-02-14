import { Request, Response, NextFunction } from "express";
import redis from "../config/redis";
import { ApiError } from "../utils/ApiError";

console.log("✅ rateLimiter.ts loaded!"); // ← Top of file

//define Rate limit for the different actions
const RATE_LIMIT = {
  login: { max: 5, window: 900 },
  register: { max: 3, window: 3600 },
  forgetPassword: { max: 3, window: 3600 },
  verify2FA: { max: 5, window: 900 },
};

//the rate limit function
export const rateLimiter = (action: keyof typeof RATE_LIMIT) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    console.log("🔍 rateLimiter called!"); // ← Inside middleware
    try {
      const ip = req.ip || req.socket.remoteAddress || "unknown";
      const key = `ratelimit:${action}:${ip}`;
      const limit = RATE_LIMIT[action];

      //get current attempt
      const attempts = await redis.get(key);
      const currentAttempts = attempts ? parseInt(attempts) : 0;

      console.log(
        `🔍 Rate limit check - Action: ${action}, IP: ${ip}, Attempts: ${currentAttempts}/${limit.max}`,
      );

      if (currentAttempts >= limit.max) {
        const ttl = await redis.ttl(key);

        // ✅ Set rateLimit on req even when blocked!
        req.rateLimit = {
          limit: limit.max,
          remaining: 0,
          window: limit.window,
        };

        res.setHeader("X-RateLimit-Limit", limit.max);
        res.setHeader("X-RateLimit-Remaining", 0);
        res.setHeader("X-RateLimit-Reset", ttl);

        console.log(`❌ Rate limit exceeded for ${ip} on ${action} `);
        throw new ApiError(
          `Too many ${action} attempts. Try again in ${Math.ceil(ttl / 60)} minutes`,
          429,
        );
      }
      //increment counter
      const newAttempts = await redis.incr(key);

      // set expiration on first attempt only
      if (newAttempts === 1) {
        await redis.expire(key, limit.window);
        console.log(`Rate limit timer starter for ${ip} on ${action}`);
      }

      //allow request to continue
      const remaining = limit.max - newAttempts;

      req.rateLimit = {
        limit: limit.max,
        remaining,
        window: limit.window,
      };

      res.setHeader("X-RateLimit-Limit", limit.max);
      res.setHeader("X-RateLimit-Remaining", remaining);
      res.setHeader("X-RateLimit-Window", limit.window);

      console.log("🔍 MIDDLEWARE - Setting rateLimit on req");
      req.rateLimit = {
        limit: limit.max,
        remaining,
        window: limit.window,
      };
      console.log("🔍 MIDDLEWARE - req.rateLimit set to:", req.rateLimit);
      next();
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }
      next(error);
      console.log("🔍 Error handler req.rateLimit:", req.rateLimit);
      console.log(
        "🔍 Error handler headers:",
        req.headers["x-request-id"] || "no-id",
      );
    }
  };
};
