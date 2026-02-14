import { IUserDocument } from "./user";

declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument | null;
      rateLimit?: {
        limit: number;
        remaining: number;
        window: number;
      };
    }
  }
}

export {};
