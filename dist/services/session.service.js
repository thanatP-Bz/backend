"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserActiveSessions = exports.cleanupExpiredSession = exports.isSessionValid = exports.deactivateSession = exports.updateSessionActivity = exports.createSession = void 0;
const sessionModel_1 = require("../models/sessionModel");
const mongoose_1 = require("mongoose");
//Create a new session when user log in
const createSession = async (input) => {
    const { userId, ipAddress, userAgent } = input;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    const session = await sessionModel_1.Session.create({
        userId: new mongoose_1.Types.ObjectId(userId),
        loginTime: new Date(),
        lastActivity: new Date(),
        expiresAt,
        ipAddress,
        userAgent,
        isActive: true,
    });
    console.log("Session created:", session._id);
    return session;
};
exports.createSession = createSession;
//Update session activity (called on every request)
const updateSessionActivity = async (sessionId) => {
    await sessionModel_1.Session.findByIdAndUpdate(sessionId, {
        lastActivity: new Date(),
    });
};
exports.updateSessionActivity = updateSessionActivity;
//Deactivate session(log out)
const deactivateSession = async (sessionId) => {
    await sessionModel_1.Session.findByIdAndUpdate(sessionId, {
        isActive: false,
    });
    console.log("session deactivated:", sessionId);
};
exports.deactivateSession = deactivateSession;
//check if session is valid
const isSessionValid = async (sessionId) => {
    const session = await sessionModel_1.Session.findById(sessionId);
    if (!session) {
        return false;
    }
    if (!session.isActive || session.expiresAt < new Date()) {
        return false;
    }
    return true;
};
exports.isSessionValid = isSessionValid;
//clean up expired session
const cleanupExpiredSession = async () => {
    const result = await sessionModel_1.Session.deleteMany({
        expiresAt: { $lt: new Date() },
    });
    console.log(`clean up ${result.deletedCount} expired sessions`);
};
exports.cleanupExpiredSession = cleanupExpiredSession;
//get all active session for a user
const getUserActiveSessions = async (userId) => {
    return await sessionModel_1.Session.find({
        userId: new mongoose_1.Types.ObjectId(userId),
        isActive: true,
        expiresAt: { $gt: new Date() },
    }).sort({ loginTime: -1 });
};
exports.getUserActiveSessions = getUserActiveSessions;
//# sourceMappingURL=session.service.js.map