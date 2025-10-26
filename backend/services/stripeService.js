import Stripe from 'stripe';

// Initialize Stripe with secret key
const stripeKey = process.env.STRIPE_SECRETE_KEY || process.env.STRIPE_SECRET_KEY;

console.log('Stripe key length:', stripeKey ? stripeKey.length : 'undefined');
console.log('Stripe key starts with:', stripeKey ? stripeKey.substring(0, 20) + '...' : 'undefined');

// Only initialize Stripe if we have a valid key
let stripe = null;
if (stripeKey && stripeKey.length > 50 && stripeKey.startsWith('sk_test_')) {
  try {
    stripe = new Stripe(stripeKey);
    console.log('✅ Stripe initialized with provided key');
  } catch (error) {
    console.log('❌ Stripe initialization failed:', error.message);
    stripe = null;
  }
} else {
  console.log('⚠️  No valid Stripe key found, using mock payments');
}

export class StripeService {
  /**
   * Create a payment intent for a bill
   * @param {Object} billData - Bill data including amount and currency
   * @returns {Promise<Object>} Payment intent object
   */
  static async createPaymentIntent(billData) {
    try {
      // If Stripe is not available, return mock payment intent
      if (!stripe) {
        console.log('Using mock payment intent (Stripe not configured)');
        return {
          success: true,
          clientSecret: `mock_client_secret_${Date.now()}`,
          paymentIntentId: `mock_${Date.now()}`,
          amount: Math.round(billData.amount * 100),
          currency: billData.currency || 'usd',
          status: 'requires_payment_method'
        };
      }

      const { amount, currency = 'usd', metadata = {} } = billData;
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata: {
          billId: metadata.billId,
          appointmentId: metadata.appointmentId,
          userId: metadata.userId,
          ...metadata
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status
      };
    } catch (error) {
      console.error('Stripe payment intent creation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Confirm a payment intent
   * @param {string} paymentIntentId - Payment intent ID
   * @returns {Promise<Object>} Confirmed payment intent
   */
  static async confirmPaymentIntent(paymentIntentId) {
    try {
      // If Stripe is not available or it's a mock payment, return mock confirmation
      if (!stripe || paymentIntentId.startsWith('mock_')) {
        console.log('Using mock payment confirmation (Stripe not configured or mock payment)');
        return {
          success: true,
          status: 'succeeded',
          paymentIntent: {
            id: paymentIntentId,
            amount: 5000, // Mock amount in cents
            status: 'succeeded'
          }
        };
      }

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        return {
          success: true,
          paymentIntent,
          status: 'succeeded'
        };
      } else if (paymentIntent.status === 'requires_payment_method') {
        return {
          success: false,
          error: 'Payment method required',
          status: 'requires_payment_method'
        };
      } else {
        return {
          success: false,
          error: 'Payment not completed',
          status: paymentIntent.status
        };
      }
    } catch (error) {
      console.error('Stripe payment confirmation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create a refund
   * @param {string} paymentIntentId - Payment intent ID
   * @param {number} amount - Refund amount in dollars
   * @returns {Promise<Object>} Refund object
   */
  static async createRefund(paymentIntentId, amount) {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: Math.round(amount * 100), // Convert to cents
      });

      return {
        success: true,
        refund,
        status: refund.status
      };
    } catch (error) {
      console.error('Stripe refund creation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get payment intent details
   * @param {string} paymentIntentId - Payment intent ID
   * @returns {Promise<Object>} Payment intent details
   */
  static async getPaymentIntent(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      return {
        success: true,
        paymentIntent
      };
    } catch (error) {
      console.error('Stripe payment intent retrieval failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create a customer
   * @param {Object} customerData - Customer data
   * @returns {Promise<Object>} Customer object
   */
  static async createCustomer(customerData) {
    try {
      const { email, name, metadata = {} } = customerData;
      
      const customer = await stripe.customers.create({
        email,
        name,
        metadata
      });

      return {
        success: true,
        customer
      };
    } catch (error) {
      console.error('Stripe customer creation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default StripeService;
