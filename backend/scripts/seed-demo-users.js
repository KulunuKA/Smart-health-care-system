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

// Seed demo users
const seedDemoUsers = async () => {
  try {
    // Demo users to create
    const demoUsers = [
      {
        firstName: "Admin",
        lastName: "User",
        email: "admin@demo.com",
        password: "password123",
        role: "Admin"
      },
      {
        firstName: "Doctor",
        lastName: "User",
        email: "doctor@demo.com",
        password: "password123",
        role: "Doctor"
      }
    ];

    // Create demo users
    for (const userData of demoUsers) {
      // Check if user already exists
      const existingUser = await UserModel.findOne({ email: userData.email });
      
      if (existingUser) {
        console.log(`User with email ${userData.email} already exists, skipping...`);
        continue;
      }

      // Create new user
      const user = new UserModel(userData);
      await user.save();
      console.log(`Created ${userData.role}: ${userData.firstName} ${userData.lastName} (${userData.email})`);
    }

    console.log("Demo users seeded successfully!");
  } catch (error) {
    console.error("Error seeding demo users:", error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await seedDemoUsers();
  await mongoose.connection.close();
  console.log("Database connection closed");
};

// Run the seed script
main().catch(console.error);
