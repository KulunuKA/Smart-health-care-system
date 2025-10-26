import mongoose from 'mongoose';
import { PatientController } from '../modules/patient/patientController.js';
import { PatientDao } from '../modules/patient/patientDao.js';
import { responseHandler } from '../utils/ResponseHandler.js';

// Mock dependencies
jest.mock('mongoose');
jest.mock('../modules/patient/patientDao.js', () => ({
  PatientDao: {
    addMedicalRecord: jest.fn()
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

describe('PatientController - addMedicalRecord', () => {
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
    
    // Mock mongoose.Types.ObjectId.isValid
    mongoose.Types = {
      ObjectId: {
        isValid: jest.fn()
      }
    };

    // Mock request and response objects
    mockReq = {
      params: {},
      body: {},
      user: {
        id: '507f1f77bcf86cd799439014' // Doctor ID
      }
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Mock response handler methods
    responseHandler.sendSuccess = jest.fn();
    responseHandler.sendError = jest.fn();
    responseHandler.sendNotFound = jest.fn();
  });

  describe('addMedicalRecord', () => {
    beforeEach(() => {
      mockReq.params = { patientId: '507f1f77bcf86cd799439011' };
      mockReq.body = {
        diagnosis: 'Hypertension',
        treatment: 'Prescribed medication',
        notes: 'Patient shows improvement',
        date: '2024-01-15'
      };
    });

    it('should successfully add medical record for a valid patient', async () => {
      // Arrange
      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      
      const mockUpdatedPatient = {
        _id: '507f1f77bcf86cd799439011',
        user: '507f1f77bcf86cd799439012',
        medicalHistory: [
          {
            diagnosis: 'Hypertension',
            treatment: 'Prescribed medication',
            notes: 'Patient shows improvement',
            date: '2024-01-15',
            doctor: '507f1f77bcf86cd799439014'
          }
        ]
      };

      PatientDao.addMedicalRecord.mockResolvedValue(mockUpdatedPatient);

      // Act
      await PatientController.addMedicalRecord(mockReq, mockRes);

      // Assert
      expect(mockSession.startTransaction).toHaveBeenCalled();
      expect(PatientDao.addMedicalRecord).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        {
          diagnosis: 'Hypertension',
          treatment: 'Prescribed medication',
          notes: 'Patient shows improvement',
          date: '2024-01-15',
          doctor: '507f1f77bcf86cd799439014'
        },
        mockSession
      );
      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
      expect(responseHandler.sendSuccess).toHaveBeenCalledWith(
        mockRes,
        mockUpdatedPatient,
        'Medical record added successfully'
      );
    });

    it('should handle invalid patient ID format', async () => {
      // Arrange
      mockReq.params = { patientId: 'invalid-id' };
      mongoose.Types.ObjectId.isValid.mockReturnValue(false);

      // Act
      await PatientController.addMedicalRecord(mockReq, mockRes);

      // Assert
      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
      expect(responseHandler.sendError).toHaveBeenCalledWith(
        mockRes,
        'Invalid patient ID',
        400
      );
      expect(PatientDao.addMedicalRecord).not.toHaveBeenCalled();
    });

    it('should handle null patient ID', async () => {
      // Arrange
      mockReq.params = { patientId: null };
      mongoose.Types.ObjectId.isValid.mockReturnValue(false);

      // Act
      await PatientController.addMedicalRecord(mockReq, mockRes);

      // Assert
      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
      expect(responseHandler.sendError).toHaveBeenCalledWith(
        mockRes,
        'Invalid patient ID',
        400
      );
    });

    it('should handle undefined patient ID', async () => {
      // Arrange
      mockReq.params = { patientId: undefined };
      mongoose.Types.ObjectId.isValid.mockReturnValue(false);

      // Act
      await PatientController.addMedicalRecord(mockReq, mockRes);

      // Assert
      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
      expect(responseHandler.sendError).toHaveBeenCalledWith(
        mockRes,
        'Invalid patient ID',
        400
      );
    });

    it('should handle empty patient ID', async () => {
      // Arrange
      mockReq.params = { patientId: '' };
      mongoose.Types.ObjectId.isValid.mockReturnValue(false);

      // Act
      await PatientController.addMedicalRecord(mockReq, mockRes);

      // Assert
      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
      expect(responseHandler.sendError).toHaveBeenCalledWith(
        mockRes,
        'Invalid patient ID',
        400
      );
    });

    it('should handle patient not found', async () => {
      // Arrange
      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      PatientDao.addMedicalRecord.mockResolvedValue(null);

      // Act
      await PatientController.addMedicalRecord(mockReq, mockRes);

      // Assert
      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
      expect(responseHandler.sendNotFound).toHaveBeenCalledWith(
        mockRes,
        'Patient not found'
      );
    });

    it('should handle database errors during medical record addition', async () => {
      // Arrange
      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      const mockError = new Error('Database connection failed');
      PatientDao.addMedicalRecord.mockRejectedValue(mockError);

      // Act
      await PatientController.addMedicalRecord(mockReq, mockRes);

      // Assert
      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
      expect(responseHandler.sendError).toHaveBeenCalledWith(mockRes, mockError);
    });

    it('should handle missing doctor ID in request user', async () => {
      // Arrange
      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      mockReq.user = {}; // No id property
      const mockUpdatedPatient = {
        _id: '507f1f77bcf86cd799439011',
        medicalHistory: []
      };

      PatientDao.addMedicalRecord.mockResolvedValue(mockUpdatedPatient);

      // Act
      await PatientController.addMedicalRecord(mockReq, mockRes);

      // Assert
      expect(PatientDao.addMedicalRecord).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        {
          diagnosis: 'Hypertension',
          treatment: 'Prescribed medication',
          notes: 'Patient shows improvement',
          date: '2024-01-15',
          doctor: undefined
        },
        mockSession
      );
    });

    it('should handle empty medical record data', async () => {
      // Arrange
      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      mockReq.body = {};
      const mockUpdatedPatient = {
        _id: '507f1f77bcf86cd799439011',
        medicalHistory: []
      };

      PatientDao.addMedicalRecord.mockResolvedValue(mockUpdatedPatient);

      // Act
      await PatientController.addMedicalRecord(mockReq, mockRes);

      // Assert
      expect(PatientDao.addMedicalRecord).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        {
          doctor: '507f1f77bcf86cd799439014'
        },
        mockSession
      );
      expect(responseHandler.sendSuccess).toHaveBeenCalled();
    });

    it('should handle complex medical record data', async () => {
      // Arrange
      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      mockReq.body = {
        diagnosis: 'Type 2 Diabetes',
        treatment: 'Metformin 500mg twice daily',
        notes: 'Patient needs to monitor blood sugar levels regularly. Follow up in 3 months.',
        date: '2024-01-15',
        symptoms: ['Frequent urination', 'Increased thirst', 'Fatigue'],
        medications: [
          {
            name: 'Metformin',
            dosage: '500mg',
            frequency: 'Twice daily'
          }
        ],
        vitalSigns: {
          bloodPressure: '140/90',
          heartRate: '85',
          temperature: '98.6F'
        },
        followUpDate: '2024-04-15'
      };

      const mockUpdatedPatient = {
        _id: '507f1f77bcf86cd799439011',
        medicalHistory: [mockReq.body]
      };

      PatientDao.addMedicalRecord.mockResolvedValue(mockUpdatedPatient);

      // Act
      await PatientController.addMedicalRecord(mockReq, mockRes);

      // Assert
      expect(PatientDao.addMedicalRecord).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        {
          ...mockReq.body,
          doctor: '507f1f77bcf86cd799439014'
        },
        mockSession
      );
      expect(responseHandler.sendSuccess).toHaveBeenCalledWith(
        mockRes,
        mockUpdatedPatient,
        'Medical record added successfully'
      );
    });

    it('should handle special characters in medical record data', async () => {
      // Arrange
      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      mockReq.body = {
        diagnosis: 'Hypertension & Diabetes',
        treatment: 'Medication: "Lisinopril 10mg" & Metformin',
        notes: 'Patient shows improvement. Follow-up in 2-3 weeks. Contact: +1-555-123-4567',
        date: '2024-01-15'
      };

      const mockUpdatedPatient = {
        _id: '507f1f77bcf86cd799439011',
        medicalHistory: [mockReq.body]
      };

      PatientDao.addMedicalRecord.mockResolvedValue(mockUpdatedPatient);

      // Act
      await PatientController.addMedicalRecord(mockReq, mockRes);

      // Assert
      expect(PatientDao.addMedicalRecord).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        {
          ...mockReq.body,
          doctor: '507f1f77bcf86cd799439014'
        },
        mockSession
      );
    });
  });
});