import { IUserDocument } from "../types/user";
export declare const handleGoogleCallback: (user: IUserDocument) => Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
        _id: import("mongoose").Types.ObjectId;
        name: string;
        email: string;
        twoFactorEnabled: boolean;
        isVerified: boolean;
        hasPassword: boolean;
    };
}>;
//# sourceMappingURL=oauth.service.d.ts.map