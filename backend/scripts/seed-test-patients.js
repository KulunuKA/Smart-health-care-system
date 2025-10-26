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

// Seed test patients
const seedTestPatients = async () => {
  try {
    // Test patients to create
    const testPatients = [
      {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@patient.com",
        password: "password123",
        role: "Patient",
        phone: "+1 (555) 123-4567",
        dateOfBirth: "1990-05-15",
        gender: "Male",
        address: {
          street: "123 Main Street",
          city: "New York",
          state: "NY",
          zipCode: "10001",
          country: "USA"
        },
        emergencyContact: {
          name: "Jane Doe",
          relationship: "Spouse",
          phone: "+1 (555) 987-6543",
          email: "jane.doe@example.com"
        },
        insurance: {
          provider: "Blue Cross Blue Shield",
          policyNumber: "BC123456789",
          groupNumber: "GRP001",
          expiryDate: "2024-12-31"
        }
      },
      {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@patient.com",
        password: "password123",
        role: "Patient",
        phone: "+1 (555) 234-5678",
        dateOfBirth: "1985-08-22",
        gender: "Female",
        address: {
          street: "456 Oak Avenue",
          city: "Los Angeles",
          state: "CA",
          zipCode: "90210",
          country: "USA"
        },
        emergencyContact: {
          name: "Bob Smith",
          relationship: "Brother",
          phone: "+1 (555) 876-5432",
          email: "bob.smith@example.com"
        },
        insurance: {
          provider: "Aetna",
          policyNumber: "AE987654321",
          groupNumber: "GRP002",
          expiryDate: "2024-11-30"
        }
      },
      {
        firstName: "Bob",
        lastName: "Johnson",
        email: "bob.johnson@patient.com",
        password: "password123",
        role: "Patient",
        phone: "+1 (555) 345-6789",
        dateOfBirth: "1978-12-03",
        gender: "Male",
        address: {
          street: "789 Pine Road",
          city: "Chicago",
          state: "IL",
          zipCode: "60601",
          country: "USA"
        },
        emergencyContact: {
          name: "Alice Johnson",
          relationship: "Wife",
          phone: "+1 (555) 765-4321",
          email: "alice.johnson@example.com"
        },
        insurance: {
          provider: "Cigna",
          policyNumber: "CI456789123",
          groupNumber: "GRP003",
          expiryDate: "2025-01-15"
        }
      }
    ];

    // Create test patients
    for (const patientData of testPatients) {
      // Check if patient already exists
      const existingPatient = await UserModel.findOne({ email: patientData.email });
      
      if (existingPatient) {
        console.log(`Patient with email ${patientData.email} already exists, skipping...`);
        continue;
      }

      // Create new patient
      const patient = new UserModel(patientData);
      await patient.save();
      console.log(`Created Patient: ${patientData.firstName} ${patientData.lastName} (${patientData.email})`);
    }

    console.log("Test patients seeded successfully!");
  } catch (error) {
    console.error("Error seeding test patients:", error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await seedTestPatients();
  await mongoose.connection.close();
  console.log("Database connection closed");
};

// Run the seed script
main().catch(console.error);
