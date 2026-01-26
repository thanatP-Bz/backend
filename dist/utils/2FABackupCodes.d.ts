import { IUserDocument } from "../types/user";
declare function generateBackupCodes(): string[];
declare function hashBackupCode(code: string): string;
declare function veirifyBackupCode(user: IUserDocument, code: string): Promise<boolean>;
export { generateBackupCodes, hashBackupCode, veirifyBackupCode };
//# sourceMappingURL=2FABackupCodes.d.ts.map