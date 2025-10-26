import mongoose from "mongoose";
import { UserModel } from "../modules/user/userModel.js";
import { AppointmentModel } from "../modules/appointments/appointmentModel.js";
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

// Seed test appointments
const seedTestAppointments = async () => {
  try {
    // First, get some patients and doctors
    const patients = await UserModel.find({ role: "Patient" }).limit(3);
    const doctors = await UserModel.find({ role: "Doctor" }).limit(2);

    if (patients.length === 0) {
      console.log("No patients found. Please run seed-test-patients.js first.");
      return;
    }

    if (doctors.length === 0) {
      console.log("No doctors found. Please create some doctors first.");
      return;
    }

    // Test appointments to create
    const testAppointments = [
      {
        userId: patients[0]._id,
        doctorId: doctors[0]._id,
        date: new Date('2024-12-20'),
        time: '10:00 AM',
        reason: 'Annual Checkup',
        status: 'scheduled',
        notes: 'Regular annual health checkup'
      },
      {
        userId: patients[0]._id,
        doctorId: doctors[1]._id,
        date: new Date('2024-12-25'),
        time: '2:00 PM',
        reason: 'Follow-up Consultation',
        status: 'confirmed',
        notes: 'Follow-up for previous treatment'
      },
      {
        userId: patients[1]._id,
        doctorId: doctors[0]._id,
        date: new Date('2024-12-22'),
        time: '11:30 AM',
        reason: 'General Consultation',
        status: 'scheduled',
        notes: 'General health consultation'
      },
      {
        userId: patients[1]._id,
        doctorId: doctors[1]._id,
        date: new Date('2024-12-28'),
        time: '3:15 PM',
        reason: 'Specialist Consultation',
        status: 'confirmed',
        notes: 'Specialist consultation for specific condition'
      },
      {
        userId: patients[2]._id,
        doctorId: doctors[0]._id,
        date: new Date('2024-12-30'),
        time: '9:00 AM',
        reason: 'Emergency Consultation',
        status: 'completed',
        notes: 'Emergency consultation completed'
      }
    ];

    // Create test appointments
    for (const appointmentData of testAppointments) {
      // Check if appointment already exists
      const existingAppointment = await AppointmentModel.findOne({
        userId: appointmentData.userId,
        doctorId: appointmentData.doctorId,
        date: appointmentData.date,
        time: appointmentData.time
      });
      
      if (existingAppointment) {
        console.log(`Appointment already exists for ${appointmentData.date} at ${appointmentData.time}, skipping...`);
        continue;
      }

      // Create new appointment
      const appointment = new AppointmentModel(appointmentData);
      await appointment.save();
      console.log(`Created appointment: ${appointmentData.reason} on ${appointmentData.date} at ${appointmentData.time}`);
    }

    console.log("Test appointments seeded successfully!");
  } catch (error) {
    console.error("Error seeding test appointments:", error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await seedTestAppointments();
  await mongoose.connection.close();
  console.log("Database connection closed");
};

// Run the seed script
main().catch(console.error);
