import { Router } from "express";
import { upload } from "../middleware/upload";
import { register, login, logout } from "../controllers/authController";

const router = Router();

router.post("/register", upload.single("profilePic"), register);
router.post("/login", login);
router.post("/logout", logout);

export default router;
