import { Router } from "express";
import { register, recognizeUser, login } from "../controllers/authController";

const router = Router();

router.post("/register", register);
router.get("/recognize", recognizeUser);
router.post("/login", login);
export default router;