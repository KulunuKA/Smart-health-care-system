import mongoose from "mongoose";
import { PatientDao } from "./patientDao.js";
import { UserModel } from "../user/userModel.js";
import { responseHandler } from "../../utils/ResponseHandler.js";

export class PatientController {
  /**
   * Get patient by ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async getPatientById(req, res) {
    try {
      const { patientId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(patientId)) {
        return responseHandler.sendError(res, "Invalid patient ID", 400);
      }

      const patient = await PatientDao.getPatientById(patientId);

      if (!patient) {
        return responseHandler.sendNotFound(res, "Patient not found");
      }

      return responseHandler.sendSuccess(res, patient, "Patient details retrieved successfully");
    } catch (error) {
      return responseHandler.sendError(res, error);
    }
  }

  /**
   * Get patient by health card number
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async getPatientByHealthCard(req, res) {
    try {
      const { healthCardNumber } = req.params;

      const patient = await PatientDao.getPatientByHealthCard(healthCardNumber);

      if (!patient) {
        return responseHandler.sendNotFound(res, "Patient not found");
      }

      return responseHandler.sendSuccess(res, patient, "Patient details retrieved successfully");
    } catch (error) {
      return responseHandler.sendError(res, error);
    }
  }

  /**
   * Update patient record
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async updatePatientRecord(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { patientId } = req.params;
      const updateData = req.body;

      if (!mongoose.Types.ObjectId.isValid(patientId)) {
        await session.abortTransaction();
        session.endSession();
        return responseHandler.sendError(res, "Invalid patient ID", 400);
      }

      const updatedPatient = await PatientDao.updatePatient(patientId, updateData, session);

      if (!updatedPatient) {
        await session.abortTransaction();
        session.endSession();
        return responseHandler.sendNotFound(res, "Patient not found");
      }

      await session.commitTransaction();
      session.endSession();

      return responseHandler.sendSuccess(res, updatedPatient, "Patient record updated successfully");
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      return responseHandler.sendError(res, error);
    }
  }

  /**
   * Get patient medical history
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async getMedicalHistory(req, res) {
    try {
      const { patientId } = req.params;
      const filters = req.query;

      if (!mongoose.Types.ObjectId.isValid(patientId)) {
        return responseHandler.sendError(res, "Invalid patient ID", 400);
      }

      // First, check if a PatientModel record exists for this user
      // We need to find PatientModel by the 'user' field, not by _id
      let patient = await PatientDao.getPatientByUserId(patientId);
      
      if (!patient) {
        // If no PatientModel exists, check if user exists and return empty history
        const user = await UserModel.findById(patientId);
        if (!user) {
          return responseHandler.sendNotFound(res, "User not found");
        }

        if (user.role !== 'Patient') {
          return responseHandler.sendError(res, "User is not a patient", 400);
        }

        // Return empty medical history for users without PatientModel records
        return responseHandler.sendSuccess(res, [], "Medical history retrieved successfully");
      }

      const history = await PatientDao.getMedicalHistory(patient._id, filters);

      return responseHandler.sendSuccess(res, history, "Medical history retrieved successfully");
    } catch (error) {
      return responseHandler.sendError(res, error);
    }
  }

  /**
   * Add medical record entry
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async addMedicalRecord(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { patientId } = req.params;
      const recordData = req.body;

      if (!mongoose.Types.ObjectId.isValid(patientId)) {
        await session.abortTransaction();
        session.endSession();
        return responseHandler.sendError(res, "Invalid patient ID", 400);
      }

      // Use doctor ID from request body (sent by frontend)
      // The doctor field should already be in recordData from the request body

      // First, check if a PatientModel record exists for this user
      // We need to find PatientModel by the 'user' field, not by _id
      let patient = await PatientDao.getPatientByUserId(patientId);
      
      if (!patient) {
        // If no PatientModel exists, create one from the UserModel
        const user = await UserModel.findById(patientId);
        if (!user) {
          await session.abortTransaction();
          session.endSession();
          return responseHandler.sendNotFound(res, "User not found");
        }

        if (user.role !== 'Patient') {
          await session.abortTransaction();
          session.endSession();
          return responseHandler.sendError(res, "User is not a patient", 400);
        }

        // Create a basic PatientModel record
        const patientData = {
          user: patientId,
          healthCardNumber: `HC${Date.now()}`, // Generate a temporary health card number
          dateOfBirth: user.dateOfBirth || new Date('1990-01-01'),
          gender: user.gender || 'other',
          phone: user.phone || 'Not provided',
          address: {
            street: user.address?.street || 'Not provided',
            city: user.address?.city || 'Not provided',
            state: user.address?.state || 'Not provided',
            zipCode: user.address?.zipCode || '00000',
            country: user.address?.country || 'Sri Lanka'
          },
          emergencyContact: {
            name: user.emergencyContact?.name || 'Not provided',
            relationship: user.emergencyContact?.relationship || 'Not provided',
            phone: user.emergencyContact?.phone || 'Not provided',
            email: user.emergencyContact?.email || ''
          },
          insurance: user.insurance || {
            provider: '',
            policyNumber: '',
            groupNumber: '',
            expiryDate: null
          },
          medicalHistory: [],
          allergies: [],
          currentMedications: [],
          vitalSigns: {},
          documents: []
        };

        console.log('Creating PatientModel record for user:', user.email);

        const createdPatient = await PatientDao.createPatient(patientData, session);
        patient = createdPatient[0];
      }

      const updatedPatient = await PatientDao.addMedicalRecord(patient._id, recordData, session);

      if (!updatedPatient) {
        await session.abortTransaction();
        session.endSession();
        return responseHandler.sendNotFound(res, "Patient not found");
      }

      await session.commitTransaction();
      session.endSession();

      return responseHandler.sendSuccess(res, updatedPatient, "Medical record added successfully");
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      return responseHandler.sendError(res, error);
    }
  }

  /**
   * Update medical record entry
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async updateMedicalRecord(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { patientId, recordId } = req.params;
      const updateData = req.body;

      if (!mongoose.Types.ObjectId.isValid(patientId) || !mongoose.Types.ObjectId.isValid(recordId)) {
        await session.abortTransaction();
        session.endSession();
        return responseHandler.sendError(res, "Invalid patient or record ID", 400);
      }

      // First, find the PatientModel by the 'user' field (same logic as addMedicalRecord and getMedicalHistory)
      let patient = await PatientDao.getPatientByUserId(patientId);
      
      if (!patient) {
        // If no PatientModel exists, check if user exists
        const user = await UserModel.findById(patientId);
        if (!user) {
          await session.abortTransaction();
          session.endSession();
          return responseHandler.sendNotFound(res, "User not found");
        }

        if (user.role !== 'Patient') {
          await session.abortTransaction();
          session.endSession();
          return responseHandler.sendError(res, "User is not a patient", 400);
        }

        await session.abortTransaction();
        session.endSession();
        return responseHandler.sendNotFound(res, "Patient record not found");
      }

      // Now update the medical record using the PatientModel._id
      const updatedPatient = await PatientDao.updateMedicalRecord(patient._id, recordId, updateData, session);

      if (!updatedPatient) {
        await session.abortTransaction();
        session.endSession();
        return responseHandler.sendNotFound(res, "Medical record not found");
      }

      await session.commitTransaction();
      session.endSession();

      return responseHandler.sendSuccess(res, updatedPatient, "Medical record updated successfully");
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      return responseHandler.sendError(res, error);
    }
  }

  /**
   * Delete medical record entry
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async deleteMedicalRecord(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { patientId, recordId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(patientId) || !mongoose.Types.ObjectId.isValid(recordId)) {
        await session.abortTransaction();
        session.endSession();
        return responseHandler.sendError(res, "Invalid patient or record ID", 400);
      }

      const updatedPatient = await PatientDao.deleteMedicalRecord(patientId, recordId, session);

      if (!updatedPatient) {
        await session.abortTransaction();
        session.endSession();
        return responseHandler.sendNotFound(res, "Patient or medical record not found");
      }

      await session.commitTransaction();
      session.endSession();

      return responseHandler.sendSuccess(res, updatedPatient, "Medical record deleted successfully");
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      return responseHandler.sendError(res, error);
    }
  }

  /**
   * Get patient allergies
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async getPatientAllergies(req, res) {
    try {
      const { patientId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(patientId)) {
        return responseHandler.sendError(res, "Invalid patient ID", 400);
      }

      const patient = await PatientDao.getPatientById(patientId);

      if (!patient) {
        return responseHandler.sendNotFound(res, "Patient not found");
      }

      return responseHandler.sendSuccess(res, patient.allergies, "Patient allergies retrieved successfully");
    } catch (error) {
      return responseHandler.sendError(res, error);
    }
  }

  /**
   * Update patient allergies
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async updatePatientAllergies(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { patientId } = req.params;
      const { allergies } = req.body;

      if (!mongoose.Types.ObjectId.isValid(patientId)) {
        await session.abortTransaction();
        session.endSession();
        return responseHandler.sendError(res, "Invalid patient ID", 400);
      }

      const updatedPatient = await PatientDao.updateAllergies(patientId, allergies, session);

      if (!updatedPatient) {
        await session.abortTransaction();
        session.endSession();
        return responseHandler.sendNotFound(res, "Patient not found");
      }

      await session.commitTransaction();
      session.endSession();

      return responseHandler.sendSuccess(res, updatedPatient.allergies, "Patient allergies updated successfully");
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      return responseHandler.sendError(res, error);
    }
  }

  /**
   * Get patient medications
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async getPatientMedications(req, res) {
    try {
      const { patientId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(patientId)) {
        return responseHandler.sendError(res, "Invalid patient ID", 400);
      }

      const patient = await PatientDao.getPatientById(patientId);

      if (!patient) {
        return responseHandler.sendNotFound(res, "Patient not found");
      }

      return responseHandler.sendSuccess(res, patient.currentMedications, "Patient medications retrieved successfully");
    } catch (error) {
      return responseHandler.sendError(res, error);
    }
  }

  /**
   * Update patient medications
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async updatePatientMedications(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { patientId } = req.params;
      const { medications } = req.body;

      if (!mongoose.Types.ObjectId.isValid(patientId)) {
        await session.abortTransaction();
        session.endSession();
        return responseHandler.sendError(res, "Invalid patient ID", 400);
      }

      const updatedPatient = await PatientDao.updateMedications(patientId, medications, session);

      if (!updatedPatient) {
        await session.abortTransaction();
        session.endSession();
        return responseHandler.sendNotFound(res, "Patient not found");
      }

      await session.commitTransaction();
      session.endSession();

      return responseHandler.sendSuccess(res, updatedPatient.currentMedications, "Patient medications updated successfully");
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      return responseHandler.sendError(res, error);
    }
  }

  /**
   * Search patients
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async searchPatients(req, res) {
    try {
      const searchParams = req.query;

      const patients = await PatientDao.searchPatients(searchParams);

      return responseHandler.sendSuccess(res, patients, "Patients search completed successfully");
    } catch (error) {
      return responseHandler.sendError(res, error);
    }
  }

  /**
   * Get patient statistics
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async getPatientStats(req, res) {
    try {
      const filters = req.query;

      const stats = await PatientDao.getPatientStats(filters);

      return responseHandler.sendSuccess(res, stats, "Patient statistics retrieved successfully");
    } catch (error) {
      return responseHandler.sendError(res, error);
    }
  }

  /**
   * Upload patient document
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async uploadPatientDocument(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { patientId } = req.params;
      const file = req.file;

      if (!mongoose.Types.ObjectId.isValid(patientId)) {
        await session.abortTransaction();
        session.endSession();
        return responseHandler.sendError(res, "Invalid patient ID", 400);
      }

      if (!file) {
        await session.abortTransaction();
        session.endSession();
        return responseHandler.sendError(res, "No file uploaded", 400);
      }

      const documentData = {
        filename: file.filename,
        originalName: file.originalname,
        filePath: file.path,
        fileType: file.mimetype,
        fileSize: file.size,
        uploadedBy: req.user.id
      };

      const updatedPatient = await PatientDao.addDocument(patientId, documentData, session);

      if (!updatedPatient) {
        await session.abortTransaction();
        session.endSession();
        return responseHandler.sendNotFound(res, "Patient not found");
      }

      await session.commitTransaction();
      session.endSession();

      return responseHandler.sendSuccess(res, documentData, "Document uploaded successfully");
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      return responseHandler.sendError(res, error);
    }
  }

  /**
   * Get patient documents
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async getPatientDocuments(req, res) {
    try {
      const { patientId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(patientId)) {
        return responseHandler.sendError(res, "Invalid patient ID", 400);
      }

      const documents = await PatientDao.getDocuments(patientId);

      return responseHandler.sendSuccess(res, documents, "Patient documents retrieved successfully");
    } catch (error) {
      return responseHandler.sendError(res, error);
    }
  }
}
