import { IUser } from "../models/Model";

declare global {
  namespace Express {
    interface Request {
      user?: IUser | null;
    }
  }
}

export {};
