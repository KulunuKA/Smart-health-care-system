import mongoose from 'mongoose';
import { PaymentController } from '../modules/payment/paymentController.js';
import { BillModel } from '../modules/payment/billModel.js';
import { UserModel } from '../modules/user/userModel.js';
import { responseHandler } from '../utils/ResponseHandler.js';
import { StripeService } from '../services/stripeService.js';

// Mock dependencies
jest.mock('mongoose');
jest.mock('../modules/payment/billModel.js', () => ({
  BillModel: {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    aggregate: jest.fn()
  }
}));
jest.mock('../modules/user/userModel.js', () => ({
  UserModel: {
    findById: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    create: jest.fn(),
    save: jest.fn()
  }
}));
jest.mock('../utils/ResponseHandler.js');
jest.mock('../services/stripeService.js');

describe('PaymentController', () => {
  let mockReq, mockRes, mockSession;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock mongoose session
    mockSession = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    };

    mongoose.startSession.mockResolvedValue(mockSession);

    // Mock request and response objects
    mockReq = {
      params: {},
      query: {},
      body: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Mock response handler methods
    responseHandler.sendSuccess = jest.fn();
    responseHandler.sendError = jest.fn();
  });

  describe('getUnpaidBills', () => {
    beforeEach(() => {
      mockReq.params = { patientId: '507f1f77bcf86cd799439011' };
    });

    it('should successfully retrieve unpaid bills for a patient', async () => {
      // Arrange
      const mockBills = [
        {
          _id: '507f1f77bcf86cd799439012',
          userId: '507f1f77bcf86cd799439011',
          amount: 100,
          status: 'unpaid',
          appointmentId: { _id: '507f1f77bcf86cd799439013', date: '2024-01-15', time: '10:00', reason: 'Checkup', status: 'scheduled' },
          userId: { _id: '507f1f77bcf86cd799439011', firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
          doctorId: { _id: '507f1f77bcf86cd799439014', firstName: 'Dr. Smith', lastName: 'MD', email: 'dr.smith@example.com' }
        }
      ];

      BillModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              sort: jest.fn().mockResolvedValue(mockBills)
            })
          })
        })
      });

      // Act
      await PaymentController.getUnpaidBills(mockReq, mockRes);

      // Assert
      expect(BillModel.find).toHaveBeenCalledWith({ userId: '507f1f77bcf86cd799439011', status: 'unpaid' });
      expect(responseHandler.sendSuccess).toHaveBeenCalledWith(
        mockRes,
        mockBills,
        'Unpaid bills retrieved successfully'
      );
    });

    it('should filter unpaid bills by date when date query parameter is provided', async () => {
      // Arrange
      mockReq.query = { date: '2024-01-15' };
      const mockBills = [];

      BillModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              sort: jest.fn().mockResolvedValue(mockBills)
            })
          })
        })
      });

      // Act
      await PaymentController.getUnpaidBills(mockReq, mockRes);

      // Assert
      expect(BillModel.find).toHaveBeenCalledWith({
        userId: '507f1f77bcf86cd799439011',
        status: 'unpaid',
        date: new Date('2024-01-15')
      });
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      const mockError = new Error('Database connection failed');
      BillModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              sort: jest.fn().mockRejectedValue(mockError)
            })
          })
        })
      });

      // Act
      await PaymentController.getUnpaidBills(mockReq, mockRes);

      // Assert
      expect(responseHandler.sendError).toHaveBeenCalledWith(mockRes, mockError);
      expect(console.error).toHaveBeenCalledWith('Error fetching unpaid bills:', mockError);
    });

    it('should return empty array when no unpaid bills found', async () => {
      // Arrange
      const mockBills = [];
      
      BillModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              sort: jest.fn().mockResolvedValue(mockBills)
            })
          })
        })
      });

      // Act
      await PaymentController.getUnpaidBills(mockReq, mockRes);

      // Assert
      expect(responseHandler.sendSuccess).toHaveBeenCalledWith(
        mockRes,
        mockBills,
        'Unpaid bills retrieved successfully'
      );
    });
  });

  describe('getPaymentHistory', () => {
    beforeEach(() => {
      mockReq.params = { patientId: '507f1f77bcf86cd799439011' };
    });

    it('should successfully retrieve payment history for a patient', async () => {
      // Arrange
      const mockPayments = [
        {
          _id: '507f1f77bcf86cd799439012',
          userId: '507f1f77bcf86cd799439011',
          amount: 150,
          status: 'paid',
          paidAt: new Date('2024-01-15'),
          transactionId: 'txn_123456',
          appointmentId: { _id: '507f1f77bcf86cd799439013', date: '2024-01-15', time: '10:00', reason: 'Checkup', status: 'confirmed' },
          userId: { _id: '507f1f77bcf86cd799439011', firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
          doctorId: { _id: '507f1f77bcf86cd799439014', firstName: 'Dr. Smith', lastName: 'MD', email: 'dr.smith@example.com' }
        }
      ];

      BillModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              sort: jest.fn().mockResolvedValue(mockPayments)
            })
          })
        })
      });

      // Act
      await PaymentController.getPaymentHistory(mockReq, mockRes);

      // Assert
      expect(BillModel.find).toHaveBeenCalledWith({ userId: '507f1f77bcf86cd799439011', status: 'paid' });
      expect(responseHandler.sendSuccess).toHaveBeenCalledWith(
        mockRes,
        mockPayments,
        'Payment history retrieved successfully'
      );
    });

    it('should filter payment history by date range when provided', async () => {
      // Arrange
      mockReq.query = { 
        startDate: '2024-01-01', 
        endDate: '2024-01-31' 
      };
      const mockPayments = [];

      BillModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              sort: jest.fn().mockResolvedValue(mockPayments)
            })
          })
        })
      });

      // Act
      await PaymentController.getPaymentHistory(mockReq, mockRes);

      // Assert
      expect(BillModel.find).toHaveBeenCalledWith({
        userId: '507f1f77bcf86cd799439011',
        status: 'paid',
        paidAt: {
          $gte: new Date('2024-01-01'),
          $lte: new Date('2024-01-31')
        }
      });
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      const mockError = new Error('Database connection failed');
      BillModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              sort: jest.fn().mockRejectedValue(mockError)
            })
          })
        })
      });

      // Act
      await PaymentController.getPaymentHistory(mockReq, mockRes);

      // Assert
      expect(responseHandler.sendError).toHaveBeenCalledWith(mockRes, mockError);
      expect(console.error).toHaveBeenCalledWith('Error fetching payment history:', mockError);
    });
  });

  describe('getPaymentById', () => {
    beforeEach(() => {
      mockReq.params = { paymentId: '507f1f77bcf86cd799439012' };
    });

    it('should successfully retrieve payment by ID', async () => {
      // Arrange
      const mockPayment = {
        _id: '507f1f77bcf86cd799439012',
        userId: '507f1f77bcf86cd799439011',
        amount: 150,
        status: 'paid',
        paidAt: new Date('2024-01-15'),
        transactionId: 'txn_123456',
        appointmentId: { _id: '507f1f77bcf86cd799439013', date: '2024-01-15', time: '10:00', reason: 'Checkup', status: 'confirmed' },
        userId: { _id: '507f1f77bcf86cd799439011', firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
        doctorId: { _id: '507f1f77bcf86cd799439014', firstName: 'Dr. Smith', lastName: 'MD', email: 'dr.smith@example.com' }
      };

      BillModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(mockPayment)
          })
        })
      });

      // Act
      await PaymentController.getPaymentById(mockReq, mockRes);

      // Assert
      expect(BillModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439012');
      expect(responseHandler.sendSuccess).toHaveBeenCalledWith(
        mockRes,
        mockPayment,
        'Payment details retrieved successfully'
      );
    });

    it('should handle payment not found', async () => {
      // Arrange
      BillModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(null)
          })
        })
      });

      // Act
      await PaymentController.getPaymentById(mockReq, mockRes);

      // Assert
      expect(responseHandler.sendError).toHaveBeenCalledWith(mockRes, 'Payment not found', 404);
    });

    it('should handle database errors', async () => {
      // Arrange
      const mockError = new Error('Database connection failed');
      BillModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockRejectedValue(mockError)
          })
        })
      });

      // Act
      await PaymentController.getPaymentById(mockReq, mockRes);

      // Assert
      expect(responseHandler.sendError).toHaveBeenCalledWith(mockRes, mockError);
      expect(console.error).toHaveBeenCalledWith('Error fetching payment:', mockError);
    });
  });

  describe('getPaymentStats', () => {
    it('should successfully retrieve payment statistics', async () => {
      // Arrange
      const mockStats = [{
        _id: null,
        totalPaid: 500,
        totalUnpaid: 200,
        totalBills: 7,
        paidBills: 5,
        unpaidBills: 2
      }];

      BillModel.aggregate.mockResolvedValue(mockStats);

      // Act
      await PaymentController.getPaymentStats(mockReq, mockRes);

      // Assert
      expect(BillModel.aggregate).toHaveBeenCalledWith([
        { $match: {} },
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
      expect(responseHandler.sendSuccess).toHaveBeenCalledWith(
        mockRes,
        mockStats[0],
        'Payment statistics retrieved successfully'
      );
    });

    it('should filter stats by patient ID when provided', async () => {
      // Arrange
      mockReq.query = { patientId: '507f1f77bcf86cd799439011' };
      const mockStats = [{
        _id: null,
        totalPaid: 300,
        totalUnpaid: 100,
        totalBills: 4,
        paidBills: 3,
        unpaidBills: 1
      }];

      BillModel.aggregate.mockResolvedValue(mockStats);

      // Act
      await PaymentController.getPaymentStats(mockReq, mockRes);

      // Assert
      expect(BillModel.aggregate).toHaveBeenCalledWith([
        { $match: { userId: '507f1f77bcf86cd799439011' } },
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
    });

    it('should return default values when no stats found', async () => {
      // Arrange
      BillModel.aggregate.mockResolvedValue([]);

      // Act
      await PaymentController.getPaymentStats(mockReq, mockRes);

      // Assert
      expect(responseHandler.sendSuccess).toHaveBeenCalledWith(
        mockRes,
        {
          totalPaid: 0,
          totalUnpaid: 0,
          totalBills: 0,
          paidBills: 0,
          unpaidBills: 0
        },
        'Payment statistics retrieved successfully'
      );
    });

    it('should handle database errors', async () => {
      // Arrange
      const mockError = new Error('Database aggregation failed');
      BillModel.aggregate.mockRejectedValue(mockError);

      // Act
      await PaymentController.getPaymentStats(mockReq, mockRes);

      // Assert
      expect(responseHandler.sendError).toHaveBeenCalledWith(mockRes, mockError);
      expect(console.error).toHaveBeenCalledWith('Error fetching payment stats:', mockError);
    });
  });

  describe('getPaymentSummary', () => {
    beforeEach(() => {
      mockReq.params = { patientId: '507f1f77bcf86cd799439011' };
    });

    it('should successfully retrieve payment summary for a patient', async () => {
      // Arrange
      const mockSummary = [
        { _id: 'paid', count: 3, totalAmount: 450, averageAmount: 150 },
        { _id: 'unpaid', count: 2, totalAmount: 200, averageAmount: 100 }
      ];

      BillModel.aggregate.mockResolvedValue(mockSummary);

      // Act
      await PaymentController.getPaymentSummary(mockReq, mockRes);

      // Assert
      expect(BillModel.aggregate).toHaveBeenCalledWith([
        { $match: { userId: '507f1f77bcf86cd799439011' } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            averageAmount: { $avg: '$amount' }
          }
        }
      ]);
      expect(responseHandler.sendSuccess).toHaveBeenCalledWith(
        mockRes,
        {
          byStatus: mockSummary,
          totalBills: 5,
          totalAmount: 650
        },
        'Payment summary retrieved successfully'
      );
    });

    it('should filter summary by date range when provided', async () => {
      // Arrange
      mockReq.query = { 
        startDate: '2024-01-01', 
        endDate: '2024-01-31' 
      };
      const mockSummary = [];

      BillModel.aggregate.mockResolvedValue(mockSummary);

      // Act
      await PaymentController.getPaymentSummary(mockReq, mockRes);

      // Assert
      expect(BillModel.aggregate).toHaveBeenCalledWith([
        { 
          $match: { 
            userId: '507f1f77bcf86cd799439011',
            date: {
              $gte: new Date('2024-01-01'),
              $lte: new Date('2024-01-31')
            }
          } 
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            averageAmount: { $avg: '$amount' }
          }
        }
      ]);
    });

    it('should handle empty summary results', async () => {
      // Arrange
      BillModel.aggregate.mockResolvedValue([]);

      // Act
      await PaymentController.getPaymentSummary(mockReq, mockRes);

      // Assert
      expect(responseHandler.sendSuccess).toHaveBeenCalledWith(
        mockRes,
        {
          byStatus: [],
          totalBills: 0,
          totalAmount: 0
        },
        'Payment summary retrieved successfully'
      );
    });

    it('should handle database errors', async () => {
      // Arrange
      const mockError = new Error('Database aggregation failed');
      BillModel.aggregate.mockRejectedValue(mockError);

      // Act
      await PaymentController.getPaymentSummary(mockReq, mockRes);

      // Assert
      expect(responseHandler.sendError).toHaveBeenCalledWith(mockRes, mockError);
      expect(console.error).toHaveBeenCalledWith('Error fetching payment summary:', mockError);
    });
  });
});