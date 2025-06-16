import express from "express";
import { getReports } from "../controllers/reportController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// جلب التقارير (أدمن)
router.get("/", auth, getReports);

export default router;
