import { Router } from "express";
import { userRoute } from "../modules/user/userRoute.js";
import { patientRoute } from "../modules/patient/patientRoute.js";
import { appointmentRoute } from "../modules/appointments/appointmentRoute.js";
import { paymentRoute } from "../modules/payment/paymentRoute.js";
import analyticsRoute from "../modules/analytics/analyticsRoute.js";
import reportRoute from "../modules/reports/reportRoute.js";

const router = Router();

// Register user routes
router.use("/", userRoute);

// Register patient routes
router.use("/", patientRoute);

// Register appointment routes
router.use("/", appointmentRoute);

// Register payment routes
router.use("/", paymentRoute);

// Register analytics routes
router.use("/analytics", analyticsRoute);

// Register reports routes
router.use("/reports", reportRoute);

export default router;