import mongoose from "mongoose";

const mongodbUrl = process.env.MONGODB_URL || "mongodb+srv://wanasinghedulan_db_user:mongo1234@cluster0.vt485e9.mongodb.net/?appName=Cluster0";
console.log("Connecting to MongoDB:", mongodbUrl);

mongoose.connect(mongodbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("MongoDB Connected Successfully!");
}).catch((error) => {
  console.error("MongoDB Connection Error:", error.message);
  console.log("Please make sure MongoDB is running or use MongoDB Atlas");
});

const connection = mongoose.connection;

connection.on("error", (error) => {
  console.error("MongoDB connection error:", error);
});

connection.once("open", () => {
  console.log("MongoDB Connected!");
});
