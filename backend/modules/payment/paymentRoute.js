import { Router } from "express";
import Joi from "joi";
import { PaymentController } from "./paymentController.js";
import { validateRequest } from "../../middleware/joiValidation.js";

const router = Router();

// Joi validation schema for payment processing
const paymentSchema = Joi.object({
  billId: Joi.string().required().messages({
    "any.required": "Bill ID is required",
  }),
  paymentMethod: Joi.string().valid("card", "bank", "wallet").required().messages({
    "any.required": "Payment method is required",
  }),
  amount: Joi.number().positive().optional(),
  paymentDetails: Joi.object().optional(),
});

// Get unpaid bills route
router.get("/payments/unpaid/:patientId", PaymentController.getUnpaidBills);

// Get payment history route
router.get("/payments/history/:patientId", PaymentController.getPaymentHistory);

// Process payment route
router.post(
  "/payments/confirm",
  validateRequest(paymentSchema),
  PaymentController.processPayment
);

// Get payment by ID route
router.get("/payments/:paymentId", PaymentController.getPaymentById);

// Get payment statistics route
router.get("/payments/stats", PaymentController.getPaymentStats);

// Get payment summary route
router.get("/payments/summary/:patientId", PaymentController.getPaymentSummary);

// Create payment intent route
router.post("/payments/create-intent", PaymentController.createPaymentIntent);

// Confirm payment route
router.post("/payments/confirm", PaymentController.confirmPayment);

export { router as paymentRoute };
