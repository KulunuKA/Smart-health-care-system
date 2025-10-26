import mongoose from "mongoose";
import { UserModel } from "../modules/user/userModel.js";
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

// Seed doctors data
const seedDoctors = async () => {
  try {
    // Check if doctors already exist
    const existingDoctors = await UserModel.find({ role: "Doctor" });
    if (existingDoctors.length > 0) {
      console.log("Doctors already exist in the database");
      return;
    }

    // Create test doctors
    const doctors = [
      {
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah.johnson@hospital.com",
        password: "password123",
        role: "Doctor",
        specialty: "General Medicine"
      },
      {
        firstName: "Michael",
        lastName: "Chen",
        email: "michael.chen@hospital.com",
        password: "password123",
        role: "Doctor",
        specialty: "Cardiology"
      },
      {
        firstName: "Emily",
        lastName: "Rodriguez",
        email: "emily.rodriguez@hospital.com",
        password: "password123",
        role: "Doctor",
        specialty: "Pediatrics"
      }
    ];

    // Create doctors
    for (const doctorData of doctors) {
      const doctor = new UserModel(doctorData);
      await doctor.save();
      console.log(`Created doctor: Dr. ${doctorData.firstName} ${doctorData.lastName}`);
    }

    console.log("Doctors seeded successfully!");
  } catch (error) {
    console.error("Error seeding doctors:", error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await seedDoctors();
  await mongoose.connection.close();
  console.log("Database connection closed");
};

// Run the seed script
main().catch(console.error);
