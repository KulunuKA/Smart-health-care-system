import mongoose from "mongoose";
import { MESSAGES } from "../../config/constants.js";
import { BillModel } from "./billModel.js";
import { UserModel } from "../user/userModel.js";
import { responseHandler } from "../../utils/ResponseHandler.js";
import { StripeService } from "../../services/stripeService.js";

export class PaymentController {
  static async getUnpaidBills(req, res) {
    try {
      const { patientId } = req.params;
      const { status, date } = req.query;
      
      let filter = { userId: patientId, status: "unpaid" };
      
      if (date) filter.date = new Date(date);

      const bills = await BillModel.find(filter)
        .populate('appointmentId', 'date time reason status')
        .populate('userId', 'firstName lastName email')
        .populate('doctorId', 'firstName lastName email')
        .sort({ date: -1 });

      return responseHandler.sendSuccess(res, bills, "Unpaid bills retrieved successfully");
    } catch (error) {
      console.error("Error fetching unpaid bills:", error);
      return responseHandler.sendError(res, error);
    }
  }

  static async getPaymentHistory(req, res) {
    try {
      const { patientId } = req.params;
      const { status, startDate, endDate } = req.query;
      
      let filter = { userId: patientId, status: "paid" };
      
      if (startDate && endDate) {
        filter.paidAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const payments = await BillModel.find(filter)
        .populate('appointmentId', 'date time reason status')
        .populate('userId', 'firstName lastName email')
        .populate('doctorId', 'firstName lastName email')
        .sort({ paidAt: -1 });

      return responseHandler.sendSuccess(res, payments, "Payment history retrieved successfully");
    } catch (error) {
      console.error("Error fetching payment history:", error);
      return responseHandler.sendError(res, error);
    }
  }

  static async processPayment(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { billId, paymentMethod, amount, paymentDetails } = req.body;

      // Find the bill
      const bill = await BillModel.findById(billId);
      if (!bill) {
        await session.abortTransaction();
        session.endSession();
        return responseHandler.sendError(res, "Bill not found", 404);
      }

      if (bill.status === "paid") {
        await session.abortTransaction();
        session.endSession();
        return responseHandler.sendError(res, "Bill is already paid", 400);
      }

      // Check if Stripe is configured
      const stripeKey = process.env.STRIPE_SECRETE_KEY || process.env.STRIPE_SECRET_KEY;
      let stripeResult;

      if (stripeKey && !stripeKey.includes('your_stripe_secret_key_here') && !stripeKey.includes('sk_test_your_stripe_secret_key_here')) {
        // Use Stripe if properly configured
        stripeResult = await StripeService.createPaymentIntent({
          amount: amount || bill.amount,
          currency: 'usd',
          metadata: {
            billId: bill._id.toString(),
            appointmentId: bill.appointmentId.toString(),
            userId: bill.userId.toString(),
            doctorId: bill.doctorId.toString()
          }
        });

        if (!stripeResult.success) {
          await session.abortTransaction();
          session.endSession();
          return responseHandler.sendError(res, `Payment processing failed: ${stripeResult.error}`, 400);
        }
      } else {
        // Fallback to mock payment processing
        console.log('Stripe not configured, using mock payment processing');
        stripeResult = {
          success: true,
          paymentIntentId: `mock_${Date.now()}`,
          amount: Math.round((amount || bill.amount) * 100),
          currency: 'usd'
        };
      }

      // Update bill with Stripe payment intent ID
      const updatedBill = await BillModel.findByIdAndUpdate(
        billId,
        {
          status: "paid",
          paymentMethod,
          paidAt: new Date(),
          transactionId: stripeResult.paymentIntentId,
          paymentDetails: {
            ...paymentDetails,
            stripePaymentIntentId: stripeResult.paymentIntentId,
            stripeClientSecret: stripeResult.clientSecret
          }
        },
        { new: true, session }
      ).populate('appointmentId', 'date time reason status')
       .populate('userId', 'firstName lastName email')
       .populate('doctorId', 'firstName lastName email');

      // Update appointment status to "confirmed" after successful payment
      if (updatedBill.appointmentId) {
        const { AppointmentModel } = await import('../appointments/appointmentModel.js');
        await AppointmentModel.findByIdAndUpdate(
          updatedBill.appointmentId._id,
          { status: "confirmed" },
          { session }
        );
        console.log(`Appointment ${updatedBill.appointmentId._id} status updated to confirmed after payment`);
      }

      await session.commitTransaction();
      session.endSession();

      const result = {
        bill: updatedBill,
        payment: {
          transactionId: stripeResult.paymentIntentId,
          status: "completed",
          amount: stripeResult.amount / 100, // Convert back to dollars
          paymentMethod,
          processedAt: new Date(),
          stripeClientSecret: stripeResult.clientSecret
        }
      };

      return responseHandler.sendSuccess(res, result, "Payment processed successfully");
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error("Error processing payment:", error);
      return responseHandler.sendError(res, error);
    }
  }

  static async getPaymentById(req, res) {
    try {
      const { paymentId } = req.params;

      const bill = await BillModel.findById(paymentId)
        .populate('appointmentId', 'date time reason status')
        .populate('userId', 'firstName lastName email')
        .populate('doctorId', 'firstName lastName email');

      if (!bill) {
        return responseHandler.sendError(res, "Payment not found", 404);
      }

      return responseHandler.sendSuccess(res, bill, "Payment details retrieved successfully");
    } catch (error) {
      console.error("Error fetching payment:", error);
      return responseHandler.sendError(res, error);
    }
  }

  static async getPaymentStats(req, res) {
    try {
      const { patientId, startDate, endDate } = req.query;
      
      let matchFilter = {};
      if (patientId) matchFilter.userId = patientId;
      if (startDate && endDate) {
        matchFilter.paidAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const stats = await BillModel.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: null,
            totalPaid: { $sum: { $cond: [{ $eq: ["$status", "paid"] }, "$amount", 0] } },
            totalUnpaid: { $sum: { $cond: [{ $eq: ["$status", "unpaid"] }, "$amount", 0] } },
            totalBills: { $sum: 1 },
            paidBills: { $sum: { $cond: [{ $eq: ["$status", "paid"] }, 1, 0] } },
            unpaidBills: { $sum: { $cond: [{ $eq: ["$status", "unpaid"] }, 1, 0] } }
          }
        }
      ]);

      const result = stats[0] || {
        totalPaid: 0,
        totalUnpaid: 0,
        totalBills: 0,
        paidBills: 0,
        unpaidBills: 0
      };

      return responseHandler.sendSuccess(res, result, "Payment statistics retrieved successfully");
    } catch (error) {
      console.error("Error fetching payment stats:", error);
      return responseHandler.sendError(res, error);
    }
  }

  static async getPaymentSummary(req, res) {
    try {
      const { patientId } = req.params;
      const { startDate, endDate } = req.query;

      let matchFilter = { userId: patientId };
      if (startDate && endDate) {
        matchFilter.date = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const summary = await BillModel.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalAmount: { $sum: "$amount" },
            averageAmount: { $avg: "$amount" }
          }
        }
      ]);

      const result = {
        byStatus: summary,
        totalBills: summary.reduce((sum, item) => sum + item.count, 0),
        totalAmount: summary.reduce((sum, item) => sum + item.totalAmount, 0)
      };

      return responseHandler.sendSuccess(res, result, "Payment summary retrieved successfully");
    } catch (error) {
      console.error("Error fetching payment summary:", error);
      return responseHandler.sendError(res, error);
    }
  }

  static async createPaymentIntent(req, res) {
    try {
      const { billId } = req.body;

      // Find the bill
      const bill = await BillModel.findById(billId);
      if (!bill) {
        return responseHandler.sendError(res, "Bill not found", 404);
      }

      if (bill.status === "paid") {
        return responseHandler.sendError(res, "Bill is already paid", 400);
      }

      // Check if Stripe is configured
      const stripeKey = process.env.STRIPE_SECRETE_KEY || process.env.STRIPE_SECRET_KEY;
      let stripeResult;

      if (stripeKey && !stripeKey.includes('your_stripe_secret_key_here') && !stripeKey.includes('sk_test_your_stripe_secret_key_here')) {
        // Use Stripe if properly configured
        stripeResult = await StripeService.createPaymentIntent({
          amount: bill.amount,
          currency: 'usd',
          metadata: {
            billId: bill._id.toString(),
            appointmentId: bill.appointmentId.toString(),
            userId: bill.userId.toString(),
            doctorId: bill.doctorId.toString()
          }
        });

        if (!stripeResult.success) {
          return responseHandler.sendError(res, `Payment intent creation failed: ${stripeResult.error}`, 400);
        }
      } else {
        // Fallback to mock payment intent
        console.log('Stripe not configured, using mock payment intent');
        stripeResult = {
          success: true,
          clientSecret: `mock_client_secret_${Date.now()}`,
          paymentIntentId: `mock_${Date.now()}`,
          amount: Math.round(bill.amount * 100),
          currency: 'usd'
        };
      }

      const result = {
        clientSecret: stripeResult.clientSecret,
        paymentIntentId: stripeResult.paymentIntentId,
        amount: stripeResult.amount / 100,
        currency: stripeResult.currency
      };

      return responseHandler.sendSuccess(res, result, "Payment intent created successfully");
    } catch (error) {
      console.error("Error creating payment intent:", error);
      return responseHandler.sendError(res, error);
    }
  }

  static async confirmPayment(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { paymentIntentId, billId } = req.body;

      // Check if Stripe is configured
      const stripeKey = process.env.STRIPE_SECRETE_KEY || process.env.STRIPE_SECRET_KEY;
      let stripeResult;

      if (stripeKey && !stripeKey.includes('your_stripe_secret_key_here') && !stripeKey.includes('sk_test_your_stripe_secret_key_here') && !paymentIntentId.startsWith('mock_')) {
        // Use Stripe if properly configured and not a mock payment
        stripeResult = await StripeService.confirmPaymentIntent(paymentIntentId);

        if (!stripeResult.success) {
          await session.abortTransaction();
          session.endSession();
          return responseHandler.sendError(res, `Payment confirmation failed: ${stripeResult.error}`, 400);
        }
      } else {
        // Fallback to mock payment confirmation
        console.log('Stripe not configured or mock payment, using mock confirmation');
        stripeResult = {
          success: true,
          status: 'succeeded',
          paymentIntent: {
            id: paymentIntentId,
            amount: 5000, // Mock amount in cents
            status: 'succeeded'
          }
        };
      }

      // Update bill status
      const updatedBill = await BillModel.findByIdAndUpdate(
        billId,
        {
          status: "paid",
          paidAt: new Date(),
          transactionId: paymentIntentId,
          paymentDetails: {
            stripePaymentIntentId: paymentIntentId,
            stripeStatus: stripeResult.status
          }
        },
        { new: true, session }
      ).populate('appointmentId', 'date time reason status')
       .populate('userId', 'firstName lastName email')
       .populate('doctorId', 'firstName lastName email');

      // Update appointment status to "confirmed" after successful payment
      if (updatedBill.appointmentId) {
        const { AppointmentModel } = await import('../appointments/appointmentModel.js');
        await AppointmentModel.findByIdAndUpdate(
          updatedBill.appointmentId._id,
          { status: "confirmed" },
          { session }
        );
        console.log(`Appointment ${updatedBill.appointmentId._id} status updated to confirmed after payment`);
      }

      await session.commitTransaction();
      session.endSession();

      const result = {
        bill: updatedBill,
        payment: {
          transactionId: paymentIntentId,
          status: "completed",
          amount: stripeResult.paymentIntent.amount / 100,
          processedAt: new Date()
        }
      };

      return responseHandler.sendSuccess(res, result, "Payment confirmed successfully");
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error("Error confirming payment:", error);
      return responseHandler.sendError(res, error);
    }
  }

  /**
   * Create Stripe Checkout Session
   * Creates a Stripe Checkout session for payment processing
   */
  static async createCheckoutSession(req, res) {
    try {
      const { amount, productName, billId, userId, doctorId, appointmentId } = req.body;

      // Validate required fields
      if (!amount || !productName) {
        return responseHandler.sendError(res, "Amount and product name are required", 400);
      }

      // Check if Stripe is configured
      const stripeKey = process.env.STRIPE_SECRETE_KEY || process.env.STRIPE_SECRET_KEY;
      
      if (!stripeKey || stripeKey.includes('your_stripe_secret_key_here') || stripeKey.includes('sk_test_your_stripe_secret_key_here')) {
        return responseHandler.sendError(res, "Stripe is not properly configured", 500);
      }

      // Initialize Stripe
      const stripe = new (await import('stripe')).default(stripeKey);

      // Create Stripe Checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: productName,
                description: `Payment for ${productName}`,
              },
              unit_amount: Math.round(amount * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-success?session_id={CHECKOUT_SESSION_ID}&bill_id=${billId || ''}`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-cancel`,
        metadata: {
          billId: billId || '',
          userId: userId || '',
          doctorId: doctorId || '',
          appointmentId: appointmentId || '',
        },
        // Enable automatic tax calculation if needed
        automatic_tax: { enabled: false },
        // Customer information
        customer_email: req.body.customerEmail || undefined,
      });

      console.log(`Stripe Checkout session created: ${session.id}`);

      return responseHandler.sendSuccess(res, { url: session.url }, "Checkout session created successfully");

    } catch (error) {
      console.error("Error creating Stripe Checkout session:", error);
      return responseHandler.sendError(res, `Failed to create checkout session: ${error.message}`, 500);
    }
  }

  /**
   * Handle Stripe Checkout Session Completion
   * Called when Stripe redirects back after successful payment
   */
  static async handleCheckoutSuccess(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { session_id, bill_id } = req.query;

      if (!session_id) {
        return responseHandler.sendError(res, "Session ID is required", 400);
      }

      // Check if Stripe is configured
      const stripeKey = process.env.STRIPE_SECRETE_KEY || process.env.STRIPE_SECRET_KEY;
      
      if (!stripeKey || stripeKey.includes('your_stripe_secret_key_here') || stripeKey.includes('sk_test_your_stripe_secret_key_here')) {
        return responseHandler.sendError(res, "Stripe is not properly configured", 500);
      }

      // Initialize Stripe
      const stripe = new (await import('stripe')).default(stripeKey);

      // Retrieve the checkout session
      const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);

      if (checkoutSession.payment_status !== 'paid') {
        await session.abortTransaction();
        session.endSession();
        return responseHandler.sendError(res, "Payment was not successful", 400);
      }

      // Find and update the bill
      let updatedBill = null;
      if (bill_id) {
        updatedBill = await BillModel.findByIdAndUpdate(
          bill_id,
          {
            status: "paid",
            paidAt: new Date(),
            transactionId: checkoutSession.payment_intent,
            paymentDetails: {
              stripeCheckoutSessionId: session_id,
              stripePaymentIntentId: checkoutSession.payment_intent,
              stripeStatus: checkoutSession.payment_status,
              paymentMethod: 'stripe_checkout'
            }
          },
          { new: true, session }
        ).populate('appointmentId', 'date time reason status')
         .populate('userId', 'firstName lastName email')
         .populate('doctorId', 'firstName lastName email');

        // Update appointment status to "confirmed" after successful payment
        if (updatedBill && updatedBill.appointmentId) {
          const { AppointmentModel } = await import('../appointments/appointmentModel.js');
          await AppointmentModel.findByIdAndUpdate(
            updatedBill.appointmentId._id,
            { status: "confirmed" },
            { session }
          );
          console.log(`Appointment ${updatedBill.appointmentId._id} status updated to confirmed after Stripe payment`);
        }
      }

      await session.commitTransaction();
      session.endSession();

      const result = {
        sessionId: session_id,
        paymentIntent: checkoutSession.payment_intent,
        amount: checkoutSession.amount_total / 100, // Convert from cents
        status: checkoutSession.payment_status,
        bill: updatedBill,
        processedAt: new Date()
      };

      return responseHandler.sendSuccess(res, result, "Payment processed successfully");

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error("Error handling checkout success:", error);
      return responseHandler.sendError(res, error);
    }
  }
}
