// Migration script to update user roles from 'Customer' to 'Patient'
import mongoose from "mongoose";
import { UserModel } from "../modules/user/userModel.js";

// MongoDB connection
const mongodbUrl = process.env.MONGODB_URL || "mongodb+srv://wanasinghedulan_db_user:mongo1234@cluster0.vt485e9.mongodb.net/?appName=Cluster0";

async function migrateUserRoles() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongodbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    // Find all users with role 'Customer'
    const usersToUpdate = await UserModel.find({ role: 'Customer' });
    console.log(`Found ${usersToUpdate.length} users with role 'Customer'`);

    if (usersToUpdate.length === 0) {
      console.log("No users found with role 'Customer'");
      return;
    }

    // Update all users with role 'Customer' to 'Patient'
    const result = await UserModel.updateMany(
      { role: 'Customer' },
      { $set: { role: 'Patient' } }
    );

    console.log(`✅ Successfully updated ${result.modifiedCount} users from 'Customer' to 'Patient'`);

    // Verify the update
    const updatedUsers = await UserModel.find({ role: 'Patient' });
    console.log(`✅ Verification: ${updatedUsers.length} users now have role 'Patient'`);

    // Show some examples of updated users
    console.log("\n📋 Updated users:");
    updatedUsers.slice(0, 5).forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - Role: ${user.role}`);
    });

    if (updatedUsers.length > 5) {
      console.log(`... and ${updatedUsers.length - 5} more users`);
    }

  } catch (error) {
    console.error("❌ Migration failed:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
  }
}

// Run the migration
migrateUserRoles();
