import mongoose from "mongoose";

const billSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["unpaid", "paid", "overdue",'verified'],
  },
  paymentMethod: {
    type: String,
    enum: ["card", "bank", "wallet"],
  },
  paidAt: {
    type: Date,
  },
  transactionId: {
    type: String,
  },
  paymentDetails: {
    type: mongoose.Schema.Types.Mixed,
  },
});

const Bill = mongoose.model("Bill", billSchema);
export { Bill as BillModel };