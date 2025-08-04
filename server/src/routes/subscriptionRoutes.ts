import { Router } from "express";
import { authMiddleware, roleMiddleware } from "../middleware/auth";
import {
	getUserSubscriptions,
	createSubscription,
	getAllSubscriptions,
} from "../controllers/subscriptionController";

const router = Router();

router.get("/me", authMiddleware, getUserSubscriptions);
router.post("/", authMiddleware, createSubscription);
router.get("/", authMiddleware, roleMiddleware(["admin"]), getAllSubscriptions);

export default router;
