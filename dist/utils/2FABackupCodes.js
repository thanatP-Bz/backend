"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBackupCodes = generateBackupCodes;
exports.hashBackupCode = hashBackupCode;
exports.veirifyBackupCode = veirifyBackupCode;
const crypto_1 = __importDefault(require("crypto"));
const ApiError_1 = require("./ApiError");
//generate backup code
function generateBackupCodes() {
    return Array.from({ length: 8 }, () => crypto_1.default.randomBytes(4).toString("hex").toUpperCase());
}
//hash backup code for storage
function hashBackupCode(code) {
    return crypto_1.default.createHash("sha256").update(code).digest("hex");
}
//Verify backup code and remove it after use (one time use)
async function veirifyBackupCode(user, code) {
    const hashedCode = hashBackupCode(code);
    if (!user.backupCodes || user.backupCodes.length === 0) {
        throw new ApiError_1.ApiError("No backup codes available", 400);
    }
    const index = user.backupCodes?.findIndex((storeCode) => storeCode === hashedCode);
    if (index === -1 || index === undefined) {
        throw new ApiError_1.ApiError("Invalid backup code", 400);
    }
    //remove use backup code
    user.backupCodes.splice(index, 1);
    await user.save();
    return true;
}
//# sourceMappingURL=2FABackupCodes.js.map