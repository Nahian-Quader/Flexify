import { Router } from "express";
import { authMiddleware, roleMiddleware } from "../middleware/auth";
import {
	getMyAvailability,
	createAvailability,
	updateAvailability,
	deleteAvailability,
	getAllTrainers,
	bookSession,
	getMyBookings,
	cancelBooking,
	getTrainerBookings,
} from "../controllers/scheduleController";

const router = Router();

router.get(
	"/my-availability",
	authMiddleware,
	roleMiddleware(["trainer"]),
	getMyAvailability
);
router.post(
	"/availability",
	authMiddleware,
	roleMiddleware(["trainer"]),
	createAvailability
);
router.patch(
	"/availability/:id",
	authMiddleware,
	roleMiddleware(["trainer"]),
	updateAvailability
);
router.delete(
	"/availability/:id",
	authMiddleware,
	roleMiddleware(["trainer"]),
	deleteAvailability
);

router.get("/trainers", authMiddleware, getAllTrainers);
router.post("/book", authMiddleware, roleMiddleware(["member"]), bookSession);
router.get(
	"/my-bookings",
	authMiddleware,
	roleMiddleware(["member"]),
	getMyBookings
);
router.patch(
	"/bookings/:id/cancel",
	authMiddleware,
	roleMiddleware(["member"]),
	cancelBooking
);

router.get(
	"/trainer-bookings",
	authMiddleware,
	roleMiddleware(["trainer"]),
	getTrainerBookings
);

export default router;
