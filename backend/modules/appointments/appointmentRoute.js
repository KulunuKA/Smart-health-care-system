import { Router } from "express";
import Joi from "joi";
import { AppointmentController } from "./appointmentController.js";
import { validateRequest } from "../../middleware/joiValidation.js";

const router = Router();

// Joi validation schema for user signup
const appointmentSchema = Joi.object({
  userId: Joi.string().required().messages({
    "any.required": "User ID is required",
  }),
  doctorId: Joi.string().required().messages({
    "any.required": "Doctor ID is required",
  }),
  date: Joi.date().required().messages({
    "any.required": "Date is required",
  }),
  time: Joi.string().required().messages({
    "any.required": "Time is required",
  }),
  reason: Joi.string().required().messages({
    "any.required": "Reason is required",
  }),
});

// Book appointment route with Joi validation
router.post(
  "/appointments/book",
  validateRequest(appointmentSchema),
  AppointmentController.bookAppointment
);

// Get appointments route
router.get("/appointments", AppointmentController.getAppointments);

// Get user's appointments route
router.get("/appointments/user/:userId", AppointmentController.getUserAppointments);

// Get appointment by ID route
router.get("/appointments/:appointmentId", AppointmentController.getAppointmentById);

// Update appointment route
router.put("/appointments/:appointmentId", AppointmentController.updateAppointment);

// Cancel appointment route
router.delete("/appointments/:appointmentId", AppointmentController.cancelAppointment);

export { router as appointmentRoute };
