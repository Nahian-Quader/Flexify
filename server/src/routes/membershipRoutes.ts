import { Router } from "express";
import { authMiddleware, roleMiddleware } from "../middleware/auth";
import {
	getAllMembershipPlans,
	createMembershipPlan,
	updateMembershipPlan,
	deleteMembershipPlan,
} from "../controllers/membershipController";

const router = Router();

router.get("/", getAllMembershipPlans);
router.post(
	"/",
	authMiddleware,
	roleMiddleware(["admin"]),
	createMembershipPlan
);
router.patch(
	"/:id",
	authMiddleware,
	roleMiddleware(["admin"]),
	updateMembershipPlan
);
router.delete(
	"/:id",
	authMiddleware,
	roleMiddleware(["admin"]),
	deleteMembershipPlan
);

export default router;
