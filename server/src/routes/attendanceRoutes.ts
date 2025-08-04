import { Router } from "express";
import { authMiddleware, roleMiddleware } from "../middleware/auth";
import {
	checkIn,
	getAttendanceLogs,
	getUserAttendanceStatus,
} from "../controllers/attendanceController";

const router = Router();

router.post("/checkin", checkIn);
router.get("/status/:userId", getUserAttendanceStatus);
router.get(
	"/logs",
	authMiddleware,
	roleMiddleware(["admin", "trainer"]),
	getAttendanceLogs
);

export default router;
