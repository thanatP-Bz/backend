import { Router } from "express";
import {
  enable2FAController,
  verify2FASetupController,
  disable2FAController,
  regenerateBackendCodesController,
} from "../controllers/2FAController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.use(requireAuth);

//generate QR codes authetication
router.post("/enable", enable2FAController);

//Verify 2FA setup
router.post("/verify-setup", verify2FASetupController);

//disable 2FA - required password
router.post("/disable", disable2FAController);

//Regenerate backup codes
router.post("/regenerate-backup-codes", regenerateBackendCodesController);

export default router;
