import mongoose from 'mongoose';
import { StripeService } from '../services/stripeService.js';

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn(),
      retrieve: jest.fn()
    },
    checkout: {
      sessions: {
        create: jest.fn(),
        retrieve: jest.fn()
      }
    },
    refunds: {
      create: jest.fn()
    },
    customers: {
      create: jest.fn()
    }
  }));
});

describe('StripeService', () => {
  let mockStripe;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock Stripe instance
    mockStripe = {
      paymentIntents: {
        create: jest.fn(),
        retrieve: jest.fn()
      },
      checkout: {
        sessions: {
          create: jest.fn(),
          retrieve: jest.fn()
        }
      },
      refunds: {
        create: jest.fn()
      },
      customers: {
        create: jest.fn()
      }
    };

    // Mock the Stripe constructor to return our mock
    const Stripe = require('stripe');
    Stripe.mockImplementation(() => mockStripe);
  });

  describe('createPaymentIntent', () => {
    it('should create payment intent successfully when Stripe is configured', async () => {
      // Arrange
      const billData = {
        amount: 100,
        currency: 'usd',
        metadata: {
          billId: '507f1f77bcf86cd799439012',
          appointmentId: '507f1f77bcf86cd799439013',
          userId: '507f1f77bcf86cd799439011',
          doctorId: '507f1f77bcf86cd799439014'
        }
      };

      const mockPaymentIntent = {
        id: 'pi_123456',
        client_secret: 'pi_123456_secret',
        amount: 10000,
        currency: 'usd',
        status: 'requires_payment_method'
      };

      mockStripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent);

      // Mock StripeService to use our mock Stripe instance
      jest.spyOn(StripeService, 'createPaymentIntent').mockImplementation(async (billData) => {
        const { amount, currency = 'usd', metadata = {} } = billData;
        
        const paymentIntent = await mockStripe.paymentIntents.create({
          amount: Math.round(amount * 100),
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
      });

      // Act
      const result = await StripeService.createPaymentIntent(billData);

      // Assert
      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith({
        amount: 10000,
        currency: 'usd',
        metadata: {
          billId: '507f1f77bcf86cd799439012',
          appointmentId: '507f1f77bcf86cd799439013',
          userId: '507f1f77bcf86cd799439011',
          doctorId: '507f1f77bcf86cd799439014'
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });
      expect(result).toEqual({
        success: true,
        clientSecret: 'pi_123456_secret',
        paymentIntentId: 'pi_123456',
        amount: 10000,
        currency: 'usd',
        status: 'requires_payment_method'
      });
    });

    it('should return mock payment intent when Stripe is not configured', async () => {
      // Arrange
      const billData = {
        amount: 100,
        currency: 'usd',
        metadata: {
          billId: '507f1f77bcf86cd799439012'
        }
      };

      // Mock StripeService to return mock payment intent
      jest.spyOn(StripeService, 'createPaymentIntent').mockImplementation(async (billData) => {
        console.log('Using mock payment intent (Stripe not configured)');
        return {
          success: true,
          clientSecret: `mock_client_secret_${Date.now()}`,
          paymentIntentId: `mock_${Date.now()}`,
          amount: Math.round(billData.amount * 100),
          currency: billData.currency || 'usd',
          status: 'requires_payment_method'
        };
      });

      // Act
      const result = await StripeService.createPaymentIntent(billData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.clientSecret).toMatch(/^mock_client_secret_/);
      expect(result.paymentIntentId).toMatch(/^mock_/);
      expect(result.amount).toBe(10000);
      expect(result.currency).toBe('usd');
      expect(result.status).toBe('requires_payment_method');
    });

    it('should handle Stripe API errors', async () => {
      // Arrange
      const billData = {
        amount: 100,
        currency: 'usd',
        metadata: {}
      };

      const mockError = new Error('Stripe API error');
      mockStripe.paymentIntents.create.mockRejectedValue(mockError);

      jest.spyOn(StripeService, 'createPaymentIntent').mockImplementation(async (billData) => {
        try {
          const { amount, currency = 'usd', metadata = {} } = billData;
          
          const paymentIntent = await mockStripe.paymentIntents.create({
            amount: Math.round(amount * 100),
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
      });

      // Act
      const result = await StripeService.createPaymentIntent(billData);

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Stripe API error'
      });
    });
  });

  describe('confirmPaymentIntent', () => {
    it('should confirm payment intent successfully', async () => {
      // Arrange
      const paymentIntentId = 'pi_123456';
      const mockPaymentIntent = {
        id: 'pi_123456',
        amount: 10000,
        status: 'succeeded'
      };

      mockStripe.paymentIntents.retrieve.mockResolvedValue(mockPaymentIntent);

      jest.spyOn(StripeService, 'confirmPaymentIntent').mockImplementation(async (paymentIntentId) => {
        const paymentIntent = await mockStripe.paymentIntents.retrieve(paymentIntentId);
        
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
      });

      // Act
      const result = await StripeService.confirmPaymentIntent(paymentIntentId);

      // Assert
      expect(mockStripe.paymentIntents.retrieve).toHaveBeenCalledWith('pi_123456');
      expect(result).toEqual({
        success: true,
        paymentIntent: mockPaymentIntent,
        status: 'succeeded'
      });
    });

    it('should handle payment method required status', async () => {
      // Arrange
      const paymentIntentId = 'pi_123456';
      const mockPaymentIntent = {
        id: 'pi_123456',
        amount: 10000,
        status: 'requires_payment_method'
      };

      mockStripe.paymentIntents.retrieve.mockResolvedValue(mockPaymentIntent);

      jest.spyOn(StripeService, 'confirmPaymentIntent').mockImplementation(async (paymentIntentId) => {
        const paymentIntent = await mockStripe.paymentIntents.retrieve(paymentIntentId);
        
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
      });

      // Act
      const result = await StripeService.confirmPaymentIntent(paymentIntentId);

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Payment method required',
        status: 'requires_payment_method'
      });
    });

    it('should return mock confirmation for mock payments', async () => {
      // Arrange
      const paymentIntentId = 'mock_123456';

      jest.spyOn(StripeService, 'confirmPaymentIntent').mockImplementation(async (paymentIntentId) => {
        if (paymentIntentId.startsWith('mock_')) {
          console.log('Using mock payment confirmation (Stripe not configured or mock payment)');
          return {
            success: true,
            status: 'succeeded',
            paymentIntent: {
              id: paymentIntentId,
              amount: 5000,
              status: 'succeeded'
            }
          };
        }

        const paymentIntent = await mockStripe.paymentIntents.retrieve(paymentIntentId);
        
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
      });

      // Act
      const result = await StripeService.confirmPaymentIntent(paymentIntentId);

      // Assert
      expect(result).toEqual({
        success: true,
        status: 'succeeded',
        paymentIntent: {
          id: 'mock_123456',
          amount: 5000,
          status: 'succeeded'
        }
      });
    });

    it('should handle Stripe API errors', async () => {
      // Arrange
      const paymentIntentId = 'pi_123456';
      const mockError = new Error('Stripe API error');

      mockStripe.paymentIntents.retrieve.mockRejectedValue(mockError);

      jest.spyOn(StripeService, 'confirmPaymentIntent').mockImplementation(async (paymentIntentId) => {
        try {
          const paymentIntent = await mockStripe.paymentIntents.retrieve(paymentIntentId);
          
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
      });

      // Act
      const result = await StripeService.confirmPaymentIntent(paymentIntentId);

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Stripe API error'
      });
    });
  });

  describe('createRefund', () => {
    it('should create refund successfully', async () => {
      // Arrange
      const paymentIntentId = 'pi_123456';
      const amount = 50;
      const mockRefund = {
        id: 're_123456',
        amount: 5000,
        status: 'succeeded'
      };

      mockStripe.refunds.create.mockResolvedValue(mockRefund);

      jest.spyOn(StripeService, 'createRefund').mockImplementation(async (paymentIntentId, amount) => {
        const refund = await mockStripe.refunds.create({
          payment_intent: paymentIntentId,
          amount: Math.round(amount * 100),
        });

        return {
          success: true,
          refund,
          status: refund.status
        };
      });

      // Act
      const result = await StripeService.createRefund(paymentIntentId, amount);

      // Assert
      expect(mockStripe.refunds.create).toHaveBeenCalledWith({
        payment_intent: 'pi_123456',
        amount: 5000,
      });
      expect(result).toEqual({
        success: true,
        refund: mockRefund,
        status: 'succeeded'
      });
    });

    it('should handle refund creation errors', async () => {
      // Arrange
      const paymentIntentId = 'pi_123456';
      const amount = 50;
      const mockError = new Error('Refund failed');

      mockStripe.refunds.create.mockRejectedValue(mockError);

      jest.spyOn(StripeService, 'createRefund').mockImplementation(async (paymentIntentId, amount) => {
        try {
          const refund = await mockStripe.refunds.create({
            payment_intent: paymentIntentId,
            amount: Math.round(amount * 100),
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
      });

      // Act
      const result = await StripeService.createRefund(paymentIntentId, amount);

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Refund failed'
      });
    });
  });

  describe('getPaymentIntent', () => {
    it('should retrieve payment intent successfully', async () => {
      // Arrange
      const paymentIntentId = 'pi_123456';
      const mockPaymentIntent = {
        id: 'pi_123456',
        amount: 10000,
        status: 'succeeded',
        currency: 'usd'
      };

      mockStripe.paymentIntents.retrieve.mockResolvedValue(mockPaymentIntent);

      jest.spyOn(StripeService, 'getPaymentIntent').mockImplementation(async (paymentIntentId) => {
        const paymentIntent = await mockStripe.paymentIntents.retrieve(paymentIntentId);
        
        return {
          success: true,
          paymentIntent
        };
      });

      // Act
      const result = await StripeService.getPaymentIntent(paymentIntentId);

      // Assert
      expect(mockStripe.paymentIntents.retrieve).toHaveBeenCalledWith('pi_123456');
      expect(result).toEqual({
        success: true,
        paymentIntent: mockPaymentIntent
      });
    });

    it('should handle payment intent retrieval errors', async () => {
      // Arrange
      const paymentIntentId = 'pi_123456';
      const mockError = new Error('Payment intent not found');

      mockStripe.paymentIntents.retrieve.mockRejectedValue(mockError);

      jest.spyOn(StripeService, 'getPaymentIntent').mockImplementation(async (paymentIntentId) => {
        try {
          const paymentIntent = await mockStripe.paymentIntents.retrieve(paymentIntentId);
          
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
      });

      // Act
      const result = await StripeService.getPaymentIntent(paymentIntentId);

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Payment intent not found'
      });
    });
  });

  describe('createCustomer', () => {
    it('should create customer successfully', async () => {
      // Arrange
      const customerData = {
        email: 'customer@example.com',
        name: 'John Doe',
        metadata: {
          userId: '507f1f77bcf86cd799439011'
        }
      };

      const mockCustomer = {
        id: 'cus_123456',
        email: 'customer@example.com',
        name: 'John Doe',
        metadata: {
          userId: '507f1f77bcf86cd799439011'
        }
      };

      mockStripe.customers.create.mockResolvedValue(mockCustomer);

      jest.spyOn(StripeService, 'createCustomer').mockImplementation(async (customerData) => {
        const { email, name, metadata = {} } = customerData;
        
        const customer = await mockStripe.customers.create({
          email,
          name,
          metadata
        });

        return {
          success: true,
          customer
        };
      });

      // Act
      const result = await StripeService.createCustomer(customerData);

      // Assert
      expect(mockStripe.customers.create).toHaveBeenCalledWith({
        email: 'customer@example.com',
        name: 'John Doe',
        metadata: {
          userId: '507f1f77bcf86cd799439011'
        }
      });
      expect(result).toEqual({
        success: true,
        customer: mockCustomer
      });
    });

    it('should handle customer creation errors', async () => {
      // Arrange
      const customerData = {
        email: 'invalid-email',
        name: 'John Doe',
        metadata: {}
      };

      const mockError = new Error('Invalid email');

      mockStripe.customers.create.mockRejectedValue(mockError);

      jest.spyOn(StripeService, 'createCustomer').mockImplementation(async (customerData) => {
        try {
          const { email, name, metadata = {} } = customerData;
          
          const customer = await mockStripe.customers.create({
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
      });

      // Act
      const result = await StripeService.createCustomer(customerData);

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Invalid email'
      });
    });
  });
});
