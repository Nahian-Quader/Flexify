import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import {
	createMetrics,
	getMyMetrics,
	updateMetrics,
	deleteMetrics,
} from "../controllers/metricsController";

const router = Router();

router.post("/", authMiddleware, createMetrics);
router.get("/me", authMiddleware, getMyMetrics);
router.patch("/:id", authMiddleware, updateMetrics);
router.delete("/:id", authMiddleware, deleteMetrics);

export default router;
