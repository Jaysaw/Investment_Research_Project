import { Router } from "express";
import { getHistory, getDetails, analyzeTicker } from "../controllers/researchController";
import { protect } from "../middlewares/auth";

const router = Router();

// Protect all research endpoints
router.use(protect);

router.post("/analyze", analyzeTicker);
router.get("/history", getHistory);
router.get("/details/:ticker", getDetails);

export default router;
