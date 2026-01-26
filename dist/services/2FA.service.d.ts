export declare const enabled2FA: (email: string) => Promise<{
    secret: string;
    qrCode: string;
    message: string;
}>;
export declare const verify2FASetup: (email: string, token: string) => Promise<{
    message: string;
    backupCodes: string[];
}>;
export declare const verify2FAToken: (email: string, token: string) => Promise<boolean>;
export declare const disable2FA: (email: string, password: string | null) => Promise<{
    message: string;
    twoFactorEnabled: boolean;
}>;
export declare const regenerateBackupCodes: (email: string) => Promise<{
    message: string;
    backupCodes: string[];
}>;
//# sourceMappingURL=2FA.service.d.ts.map