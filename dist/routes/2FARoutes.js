"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const _2FAController_1 = require("../controllers/2FAController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.requireAuth);
//generate QR codes authetication
router.post("/enable", _2FAController_1.enable2FAController);
//Verify 2FA setup
router.post("/verify-setup", _2FAController_1.verify2FASetupController);
//disable 2FA - required password
router.post("/disable", _2FAController_1.disable2FAController);
//Regenerate backup codes
router.post("/regenerate-backup-codes", _2FAController_1.regenerateBackendCodesController);
exports.default = router;
//# sourceMappingURL=2FARoutes.js.map