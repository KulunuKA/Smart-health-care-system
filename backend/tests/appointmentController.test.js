import { AppointmentModel } from "../modules/appointments/appointmentModel.js";
import { UserModel } from "../modules/user/userModel.js";
import { BillModel } from "../modules/bill/billModel.js";
import { responseHandler } from "../utils/ResponseHandler.js";
import { AppointmentController} from "../modules/appointments/appointmentController.js"
import mongoose from "mongoose";

// Mocks
jest.mock("mongoose");
jest.mock("../modules/appointments/appointmentModel.js");
jest.mock("../modules/user/userModel.js");
jest.mock("../modules/bill/billModel.js");
jest.mock("../utils/ResponseHandler.js");

describe("AppointmentController.bookAppointment", () => {
  let req, res, session;

  beforeEach(() => {
    req = {
      body: {
        userId: "user123",
        doctorId: "doctor123",
        date: "2025-11-10",
        time: "10:00 AM",
        reason: "consultation"
      }
    };
    res = {};
    session = { startTransaction: jest.fn(), commitTransaction: jest.fn(), abortTransaction: jest.fn(), endSession: jest.fn() };
    mongoose.startSession.mockResolvedValue(session);
  });

  it("should return error if user not found", async () => {
    UserModel.findById.mockResolvedValueOnce(null);
    await AppointmentController.bookAppointment(req, res);
    expect(responseHandler.sendError).toHaveBeenCalledWith(res, "User not found", 404);
  });

  it("should return error if doctor not found", async () => {
    UserModel.findById
      .mockResolvedValueOnce({ _id: "user123" }) // user exists
      .mockResolvedValueOnce(null); // doctor not found
    await AppointmentController.bookAppointment(req, res);
    expect(responseHandler.sendError).toHaveBeenCalledWith(res, "Doctor not found. Please select a valid doctor.", 404);
  });

  it("should return error if doctor not available", async () => {
    UserModel.findById.mockResolvedValue({ _id: "user123" });
    AppointmentModel.findOne.mockResolvedValue({ _id: "appt1" });
    await AppointmentController.bookAppointment(req, res);
    expect(responseHandler.sendError).toHaveBeenCalledWith(res, "Doctor is not available at this time", 400);
  });

  it("should book appointment successfully", async () => {
    UserModel.findById.mockResolvedValue({ _id: "user123" });
    AppointmentModel.findOne.mockResolvedValue(null);
    AppointmentModel.create.mockResolvedValue([{ _id: "appt1" }]);
    BillModel.create.mockResolvedValue([{ _id: "bill1" }]);
    AppointmentModel.findByIdAndUpdate.mockResolvedValue({});
    AppointmentModel.findById.mockResolvedValue({
      _id: "appt1",
      userId: { _id: "user123", firstName: "John", lastName: "Doe", email: "john@example.com" },
      doctorId: { _id: "doctor123", firstName: "Jane", lastName: "Smith", email: "jane@example.com" },
      date: new Date(),
      time: "10:00 AM",
      reason: "consultation",
      status: "scheduled",
      billId: { _id: "bill1", amount: 50 }
    });

    await AppointmentController.bookAppointment(req, res);

    expect(responseHandler.sendSuccess).toHaveBeenCalledWith(
      res,
      expect.objectContaining({
        userId: expect.any(Object),
        doctorId: expect.any(Object),
        billId: expect.any(Object)
      }),
      "Appointment booked successfully"
    );
  });
});
