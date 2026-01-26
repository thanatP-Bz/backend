import { IUser } from "../types/user";
export declare const register: (data: IUser) => Promise<{
    user: {
        _id: string;
        email: string;
        name: string;
    };
    message: string;
}>;
export declare const login: (data: IUser) => Promise<{
    requires2FA: boolean;
    message: string;
    userId: string;
    accessToken?: never;
    refreshToken?: never;
    user?: never;
} | {
    message: string;
    accessToken: string;
    refreshToken: string;
    user: {
        _id: import("mongoose").Types.ObjectId;
        name: string;
        email: string;
        hasPassword: boolean;
    };
    requires2FA?: never;
    userId?: never;
}>;
export declare const verify2FALogin: (userId: string, token: string) => Promise<{
    message: string;
    accessToken: string;
    refreshToken: string;
    user: {
        _id: import("mongoose").Types.ObjectId;
        name: string;
        email: string;
        twoFactorEnabled: boolean;
    };
}>;
export declare const logout: (userId: string) => Promise<{
    message: string;
}>;
//# sourceMappingURL=auth.service.d.ts.map