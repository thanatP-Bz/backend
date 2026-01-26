import { Model } from "mongoose";
import { IUser } from "../types/user";
export interface UserModel extends Model<IUser> {
    checkEmail(email: string): Promise<boolean>;
    login(email: string, password: string): Promise<IUser>;
}
export declare const User: UserModel;
//# sourceMappingURL=authModel.d.ts.map