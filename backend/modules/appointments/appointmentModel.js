import mongoose from "mongoose";
import { BillModel } from "../bill/billModel.js";

const appointmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["scheduled", "confirmed", "cancelled", "completed"],
  },
  billId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bill",
    required: false, // Will be set after bill creation
  },
});

// Bill creation is now handled in the appointment controller

const AppointmentModel = mongoose.model("Appointment", appointmentSchema);

export { AppointmentModel };
