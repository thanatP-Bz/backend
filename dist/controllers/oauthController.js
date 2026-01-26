"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleCallbackController = void 0;
const oauth_service_1 = require("../services/oauth.service");
const session_service_1 = require("../services/session.service");
const googleCallbackController = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_user`);
        }
        const { accessToken, refreshToken } = await (0, oauth_service_1.handleGoogleCallback)(user);
        // ✅ NEW: Create session for OAuth login (same as regular login)
        const session = await (0, session_service_1.createSession)({
            userId: user._id.toString(),
            ipAddress: req.ip || req.socket.remoteAddress || "unknown",
            userAgent: req.headers["user-agent"] || "unknown",
        });
        // Encode user data
        const userData = encodeURIComponent(JSON.stringify({
            _id: user._id,
            name: user.name,
            email: user.email,
            isVerified: user.isVerified,
            twoFactorEnabled: user.twoFactorEnabled,
            authProvider: user.authProvider,
            profilePicture: user.profilePicture,
            hasPassword: !!user.password,
        }));
        // ✅ NEW: Include sessionId in redirect URL
        const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}&sessionId=${session._id.toString()}&user=${userData}`;
        res.redirect(redirectUrl);
    }
    catch (error) {
        res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
    }
};
exports.googleCallbackController = googleCallbackController;
//# sourceMappingURL=oauthController.js.map