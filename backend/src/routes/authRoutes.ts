import { Router } from "express";
import { login, register, logout, refreshToken, getMe, loginGoogle } from "../controllers/authController";
import { protect } from "../middlewares/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", loginGoogle);
router.post("/logout", logout);
router.post("/refresh", refreshToken);
router.get("/me", protect, getMe);

export default router;
