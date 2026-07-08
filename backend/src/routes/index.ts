import { Router } from "express";
import authRoutes from "./authRoutes";
import researchRoutes from "./researchRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/research", researchRoutes);

export default router;
