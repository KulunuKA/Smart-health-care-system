import mongoose from "mongoose";
import { MESSAGES } from "../../config/constants.js";
import { AppointmentModel } from "./appointmentModel.js";
import { UserModel } from "../user/userModel.js";
import { BillModel } from "../payment/billModel.js";
import { responseHandler } from "../../utils/ResponseHandler.js";

export class AppointmentController {
  static async bookAppointment(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { userId, doctorId, date, time, reason } = req.body;

      // Validate that user exists
      const user = await UserModel.findById(userId);
      if (!user) {
        await session.abortTransaction();
        session.endSession();
        return responseHandler.sendError(res, "User not found", 404);
      }

      // Validate that doctor exists
      const doctor = await UserModel.findById(doctorId);
      if (!doctor) {
        await session.abortTransaction();
        session.endSession();
        return responseHandler.sendError(res, "Doctor not found. Please select a valid doctor.", 404);
      }

      // Check if doctor is available at the requested time
      const existingAppointment = await AppointmentModel.findOne({
        doctorId,
        date: new Date(date),
        time,
        status: { $in: ["scheduled", "confirmed"] }
      });

      if (existingAppointment) {
        await session.abortTransaction();
        session.endSession();
        return responseHandler.sendError(res, "Doctor is not available at this time", 400);
      }

      // Create appointment data
      const appointmentData = {
        userId,
        doctorId,
        date: new Date(date),
        time,
        reason,
        status: "scheduled"
      };

      // Create new appointment
      const newAppointment = await AppointmentModel.create([appointmentData], { session });

      // Calculate appointment fee
      const calculateAppointmentFee = (time, reason) => {
        const timeSlotFees = {
          "9:00 AM": 50,
          "10:00 AM": 50,
          "11:00 AM": 75,
          "2:00 PM": 50,
          "3:00 PM": 75
        };
        
        let baseFee = timeSlotFees[time] || 50;
        
        const reasonLower = reason.toLowerCase();
        if (reasonLower.includes("consultation") || reasonLower.includes("follow-up")) {
          baseFee = Math.max(baseFee, 50);
        } else if (reasonLower.includes("checkup") || reasonLower.includes("physical")) {
          baseFee = Math.max(baseFee, 100);
        } else if (reasonLower.includes("emergency") || reasonLower.includes("urgent")) {
          baseFee = Math.max(baseFee, 150);
        }
        
        return baseFee;
      };

      // Create bill for the appointment
      const amount = calculateAppointmentFee(appointmentData.time, appointmentData.reason);
      const bill = await BillModel.create([{
        appointmentId: newAppointment[0]._id,
        userId: appointmentData.userId,
        doctorId: appointmentData.doctorId,
        date: appointmentData.date,
        amount: amount,
        status: "unpaid",
      }], { session });

      // Update appointment with bill ID
      await AppointmentModel.findByIdAndUpdate(
        newAppointment[0]._id, 
        { billId: bill[0]._id }, 
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      // Populate the appointment with user and doctor details
      const populatedAppointment = await AppointmentModel.findById(newAppointment[0]._id)
        .populate('userId', 'firstName lastName email')
        .populate('doctorId', 'firstName lastName email')
        .populate('billId');

      const result = {
        _id: populatedAppointment._id,
        userId: {
          _id: populatedAppointment.userId._id,
          firstName: populatedAppointment.userId.firstName,
          lastName: populatedAppointment.userId.lastName,
          email: populatedAppointment.userId.email
        },
        doctorId: {
          _id: populatedAppointment.doctorId._id,
          firstName: populatedAppointment.doctorId.firstName,
          lastName: populatedAppointment.doctorId.lastName,
          email: populatedAppointment.doctorId.email
        },
        date: populatedAppointment.date,
        time: populatedAppointment.time,
        reason: populatedAppointment.reason,
        status: populatedAppointment.status,
        billId: populatedAppointment.billId
      };

      return responseHandler.sendSuccess(res, result, "Appointment booked successfully");
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error("Error booking appointment:", error);
      return responseHandler.sendError(res, error);
    }
  }

  static async getAppointments(req, res) {
    try {
      const { userId, doctorId, status, date } = req.query;
      
      let filter = {};
      
      if (userId) filter.userId = userId;
      if (doctorId) filter.doctorId = doctorId;
      if (status) filter.status = status;
      if (date) filter.date = new Date(date);

      const appointments = await AppointmentModel.find(filter)
        .populate('userId', 'firstName lastName email')
        .populate('doctorId', 'firstName lastName email')
        .populate('billId')
        .sort({ date: 1, time: 1 });

      return responseHandler.sendSuccess(res, appointments, "Appointments retrieved successfully");
    } catch (error) {
      console.error("Error fetching appointments:", error);
      return responseHandler.sendError(res, error);
    }
  }

  static async getUserAppointments(req, res) {
    try {
      const { userId } = req.params;
      const { status, date } = req.query;
      
      let filter = { userId };
      
      if (status) filter.status = status;
      if (date) filter.date = new Date(date);

      const appointments = await AppointmentModel.find(filter)
        .populate('userId', 'firstName lastName email')
        .populate('doctorId', 'firstName lastName email')
        .populate('billId')
        .sort({ date: 1, time: 1 });

      return responseHandler.sendSuccess(res, appointments, "User appointments retrieved successfully");
    } catch (error) {
      console.error("Error fetching user appointments:", error);
      return responseHandler.sendError(res, error);
    }
  }

  static async getAppointmentById(req, res) {
    try {
      const { appointmentId } = req.params;

      const appointment = await AppointmentModel.findById(appointmentId)
        .populate('userId', 'firstName lastName email')
        .populate('doctorId', 'firstName lastName email')
        .populate('billId');

      if (!appointment) {
        return responseHandler.sendError(res, "Appointment not found", 404);
      }

      return responseHandler.sendSuccess(res, appointment, "Appointment retrieved successfully");
    } catch (error) {
      console.error("Error fetching appointment:", error);
      return responseHandler.sendError(res, error);
    }
  }

  static async updateAppointment(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { appointmentId } = req.params;
      const updateData = req.body;

      const appointment = await AppointmentModel.findById(appointmentId);
      if (!appointment) {
        await session.abortTransaction();
        session.endSession();
        return responseHandler.sendError(res, "Appointment not found", 404);
      }

      // Update appointment
      const updatedAppointment = await AppointmentModel.findByIdAndUpdate(
        appointmentId,
        updateData,
        { new: true, session }
      ).populate('userId', 'firstName lastName email')
       .populate('doctorId', 'firstName lastName email')
       .populate('billId');

      await session.commitTransaction();
      session.endSession();

      return responseHandler.sendSuccess(res, updatedAppointment, "Appointment updated successfully");
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error("Error updating appointment:", error);
      return responseHandler.sendError(res, error);
    }
  }

  static async getAllAppointments(req, res) {
    try {
      const { status, date, doctorId, userId, page = 1, limit = 10 } = req.query;
      
      let filter = {};
      
      if (status) filter.status = status;
      if (date) filter.date = new Date(date);
      if (doctorId) filter.doctorId = doctorId;
      if (userId) filter.userId = userId;

      const skip = (page - 1) * limit;

      const appointments = await AppointmentModel.find(filter)
        .populate('userId', 'firstName lastName email role')
        .populate('doctorId', 'firstName lastName email role specialty')
        .populate('billId')
        .sort({ date: -1, time: 1 })
        .skip(skip)
        .limit(parseInt(limit));

      // Get total count for pagination
      const totalCount = await AppointmentModel.countDocuments(filter);

      const result = {
        appointments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNext: page * limit < totalCount,
          hasPrev: page > 1
        }
      };

      return responseHandler.sendSuccess(res, result, "All appointments retrieved successfully");
    } catch (error) {
      console.error("Error fetching all appointments:", error);
      return responseHandler.sendError(res, error);
    }
  }

  static async getAppointmentStats(req, res) {
    try {
      const { dateRange } = req.query;
      
      let dateFilter = {};
      if (dateRange) {
        const [startDate, endDate] = dateRange.split(',');
        if (startDate && endDate) {
          dateFilter.date = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          };
        }
      }

      const stats = await AppointmentModel.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      // Get total appointments
      const totalAppointments = await AppointmentModel.countDocuments(dateFilter);

      // Get appointments by doctor
      const doctorStats = await AppointmentModel.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$doctorId',
            count: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'doctor'
          }
        },
        {
          $unwind: '$doctor'
        },
        {
          $project: {
            doctorName: { $concat: ['$doctor.firstName', ' ', '$doctor.lastName'] },
            count: 1
          }
        },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);

      const result = {
        totalAppointments,
        statusBreakdown: stats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        topDoctors: doctorStats
      };

      return responseHandler.sendSuccess(res, result, "Appointment statistics retrieved successfully");
    } catch (error) {
      console.error("Error fetching appointment statistics:", error);
      return responseHandler.sendError(res, error);
    }
  }

  static async cancelAppointment(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { appointmentId } = req.params;
      const { reason } = req.body;

      const appointment = await AppointmentModel.findById(appointmentId);
      if (!appointment) {
        await session.abortTransaction();
        session.endSession();
        return responseHandler.sendError(res, "Appointment not found", 404);
      }

      // Update appointment status to cancelled
      const cancelledAppointment = await AppointmentModel.findByIdAndUpdate(
        appointmentId,
        { status: "cancelled", cancellationReason: reason },
        { new: true, session }
      ).populate('userId', 'firstName lastName email')
       .populate('doctorId', 'firstName lastName email')
       .populate('billId');

      await session.commitTransaction();
      session.endSession();

      return responseHandler.sendSuccess(res, cancelledAppointment, "Appointment cancelled successfully");
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error("Error cancelling appointment:", error);
      return responseHandler.sendError(res, error);
    }
  }
}
