import crypto from "crypto";
import { IUserDocument } from "../types/user";
import { ApiError } from "./ApiError";

//generate backup code
function generateBackupCodes(): string[] {
  return Array.from({ length: 8 }, () =>
    crypto.randomBytes(4).toString("hex").toUpperCase()
  );
}

//hash backup code for storage
function hashBackupCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

//Verify backup code and remove it after use (one time use)
async function veirifyBackupCode(
  user: IUserDocument,
  code: string
): Promise<boolean> {
  const hashedCode = hashBackupCode(code);

  if (!user.backupCodes || user.backupCodes.length === 0) {
    throw new ApiError("No backup codes available", 400);
  }

  const index = user.backupCodes?.findIndex(
    (storeCode: string) => storeCode === hashedCode
  );

  if (index === -1 || index === undefined) {
    throw new ApiError("Invalid backup code", 400);
  }

  //remove use backup code
  user.backupCodes.splice(index, 1);
  await user.save();

  return true;
}

export { generateBackupCodes, hashBackupCode, veirifyBackupCode };
