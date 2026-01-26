"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("../config/passport"));
const oauthController_1 = require("../controllers/oauthController");
const router = express_1.default.Router();
router.get("/google", passport_1.default.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
}));
router.get("/google/callback", passport_1.default.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed`,
}), oauthController_1.googleCallbackController);
exports.default = router;
//# sourceMappingURL=oauthRoutes.js.map