"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const researchController_1 = require("../controllers/researchController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// Protect all research endpoints
router.use(auth_1.protect);
router.post("/analyze", researchController_1.analyzeTicker);
router.get("/history", researchController_1.getHistory);
router.get("/details/:ticker", researchController_1.getDetails);
exports.default = router;
