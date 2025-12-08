import { Router } from "express";
import { registerUser, loginUser } from "../controllers/authController";

const router = Router();
//require auth for workout
/* router.use(requireAuth) */

//POST /api/auth/register
router.post("/register", registerUser);

//POST /api/auth/login
router.post("/login", loginUser);

export default router;
