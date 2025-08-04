import { Router } from "express";
import { upload } from "../middleware/upload";
import { authMiddleware, roleMiddleware } from "../middleware/auth";
import {
	getMe,
	updateMe,
	getAllUsers,
	updateUserRole,
	deleteUser,
} from "../controllers/userController";

const router = Router();

router.get("/me", authMiddleware, getMe);
router.patch("/me", authMiddleware, upload.single("profilePic"), updateMe);
router.get("/", authMiddleware, roleMiddleware(["admin"]), getAllUsers);
router.patch(
	"/:id/role",
	authMiddleware,
	roleMiddleware(["admin"]),
	updateUserRole
);
router.delete("/:id", authMiddleware, roleMiddleware(["admin"]), deleteUser);

export default router;
