import mongoose from "mongoose";
import { AppointmentModel } from "../modules/appointments/appointmentModel.js";
import { BillModel } from "../modules/bill/billModel.js";
import dotenv from "dotenv";

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongodbUrl = process.env.MONGODB_URL || "mongodb+srv://wanasinghedulan_db_user:mongo1234@cluster0.vt485e9.mongodb.net/?appName=Cluster0";
    console.log("Connecting to MongoDB:", mongodbUrl);
    
    await mongoose.connect(mongodbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Calculate appointment fee based on time and reason
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

// Fix missing bills for existing appointments
const fixMissingBills = async () => {
  try {
    // Find appointments without bills
    const appointmentsWithoutBills = await AppointmentModel.find({
      $or: [
        { billId: { $exists: false } },
        { billId: null }
      ]
    });

    console.log(`Found ${appointmentsWithoutBills.length} appointments without bills`);

    for (const appointment of appointmentsWithoutBills) {
      try {
        // Check if bill already exists for this appointment
        const existingBill = await BillModel.findOne({ appointmentId: appointment._id });
        
        if (existingBill) {
          console.log(`Bill already exists for appointment ${appointment._id}, updating appointment...`);
          await AppointmentModel.findByIdAndUpdate(appointment._id, { billId: existingBill._id });
          continue;
        }

        // Calculate appointment fee
        const amount = calculateAppointmentFee(appointment.time, appointment.reason);
        
        // Create bill
        const bill = await BillModel.create({
          appointmentId: appointment._id,
          userId: appointment.userId,
          doctorId: appointment.doctorId,
          date: appointment.date,
          amount: amount,
          status: "unpaid",
        });

        // Update appointment with bill ID
        await AppointmentModel.findByIdAndUpdate(appointment._id, { billId: bill._id });
        
        console.log(`Created bill for appointment ${appointment._id} with amount $${amount}`);
      } catch (error) {
        console.error(`Error creating bill for appointment ${appointment._id}:`, error);
      }
    }

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Error during migration:", error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await fixMissingBills();
  await mongoose.connection.close();
  console.log("Database connection closed");
};

// Run the migration script
main().catch(console.error);
