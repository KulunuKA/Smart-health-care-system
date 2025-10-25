import dotenv from "dotenv";
dotenv.config();
import "./config/mongoose.js";
import express from "express";
import cors from "cors";
import router from "./routes/_index.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/", router);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server is up and running on port " + PORT);
});
