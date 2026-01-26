"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Session = void 0;
const mongoose_1 = require("mongoose");
const sessionSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    loginTime: { type: Date, default: Date.now, required: true },
    lastActivity: { type: Date, default: Date.now, required: true },
    expiresAt: { type: Date, required: true },
    ipAddress: { type: String, required: true },
    userAgent: { type: String, required: true },
    isActive: { type: Boolean, default: true, required: true },
}, {
    timestamps: true,
});
sessionSchema.index({ userId: 1, isActive: 1 });
sessionSchema.index({ expiresAt: 1 });
exports.Session = (0, mongoose_1.model)("session", sessionSchema);
//# sourceMappingURL=sessionModel.js.map