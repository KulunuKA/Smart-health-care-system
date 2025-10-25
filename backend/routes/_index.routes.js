import { Router } from "express";
import { userRoute } from "../modules/user/userRoute.js";

const router = Router();

// Register user routes
router.use("/", userRoute);

export default router;