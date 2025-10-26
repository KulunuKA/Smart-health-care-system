import { Router } from "express";
import { userRoute } from "../modules/user/userRoute.js";
import { appointmentRoute } from "../modules/appointments/appointmentRoute.js";
import { paymentRoute } from "../modules/payment/paymentRoute.js";

const router = Router();

// Register user routes
router.use("/", userRoute);

// Register appointment routes
router.use("/", appointmentRoute);

// Register payment routes
router.use("/", paymentRoute);

export default router;