import jwt from "jsonwebtoken";
export declare const generateAccessToken: (userId: string) => string;
export declare const generateRefreshToken: (userId: string) => string;
export declare const verifyAccessToken: (token: string) => string | jwt.JwtPayload | null;
export declare const verifyRefreshToken: (token: string) => string | jwt.JwtPayload | null;
//# sourceMappingURL=generateToken.d.ts.map