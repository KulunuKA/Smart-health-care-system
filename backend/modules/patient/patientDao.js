import { PatientModel } from "./patientModel.js";
import { UserModel } from "../user/userModel.js";

export class PatientDao {
  /**
   * Create a new patient
   * @param {Object} patientData - Patient data
   * @param {Object} session - MongoDB session
   * @returns {Promise<Object>} - Created patient
   */
  static async createPatient(patientData, session) {
    try {
      return await PatientModel.create([patientData], { session });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get patient by ID
   * @param {string} patientId - Patient ID
   * @returns {Promise<Object>} - Patient data
   */
  static async getPatientById(patientId) {
    try {
      return await PatientModel.findById(patientId)
        .populate('user', 'email firstName lastName')
        .populate('medicalHistory.doctor', 'firstName lastName email')
        .populate('currentMedications.prescribedBy', 'firstName lastName email');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get patient by user ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Patient data
   */
  static async getPatientByUserId(userId) {
    try {
      return await PatientModel.findOne({ user: userId })
        .populate('user', 'email firstName lastName')
        .populate('medicalHistory.doctor', 'firstName lastName email')
        .populate('currentMedications.prescribedBy', 'firstName lastName email');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get patient by health card number
   * @param {string} healthCardNumber - Health card number
   * @returns {Promise<Object>} - Patient data
   */
  static async getPatientByHealthCard(healthCardNumber) {
    try {
      return await PatientModel.findOne({ healthCardNumber })
        .populate('user', 'email firstName lastName')
        .populate('medicalHistory.doctor', 'firstName lastName email')
        .populate('currentMedications.prescribedBy', 'firstName lastName email');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update patient record
   * @param {string} patientId - Patient ID
   * @param {Object} updateData - Update data
   * @param {Object} session - MongoDB session
   * @returns {Promise<Object>} - Updated patient
   */
  static async updatePatient(patientId, updateData, session) {
    try {
      return await PatientModel.findByIdAndUpdate(
        patientId,
        { $set: updateData },
        { new: true, session }
      ).populate('user', 'email firstName lastName');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add medical record to patient
   * @param {string} patientId - Patient ID
   * @param {Object} recordData - Medical record data
   * @param {Object} session - MongoDB session
   * @returns {Promise<Object>} - Updated patient
   */
  static async addMedicalRecord(patientId, recordData, session) {
    try {
      return await PatientModel.findByIdAndUpdate(
        patientId,
        { $push: { medicalHistory: recordData } },
        { new: true, session }
      ).populate('user', 'email firstName lastName')
       .populate('medicalHistory.doctor', 'firstName lastName email');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update medical record
   * @param {string} patientId - Patient ID
   * @param {string} recordId - Medical record ID
   * @param {Object} updateData - Update data
   * @param {Object} session - MongoDB session
   * @returns {Promise<Object>} - Updated patient
   */
  static async updateMedicalRecord(patientId, recordId, updateData, session) {
    try {
      // Build the update object dynamically based on provided fields
      const updateFields = {};
      
      // Only update fields that are provided in updateData
      if (updateData.title !== undefined) updateFields['medicalHistory.$.title'] = updateData.title;
      if (updateData.description !== undefined) updateFields['medicalHistory.$.description'] = updateData.description;
      if (updateData.diagnosis !== undefined) updateFields['medicalHistory.$.diagnosis'] = updateData.diagnosis;
      if (updateData.treatment !== undefined) updateFields['medicalHistory.$.treatment'] = updateData.treatment;
      if (updateData.notes !== undefined) updateFields['medicalHistory.$.notes'] = updateData.notes;
      if (updateData.status !== undefined) updateFields['medicalHistory.$.status'] = updateData.status;
      if (updateData.followUpRequired !== undefined) updateFields['medicalHistory.$.followUpRequired'] = updateData.followUpRequired;
      if (updateData.followUpDate !== undefined) updateFields['medicalHistory.$.followUpDate'] = updateData.followUpDate;
      if (updateData.doctor !== undefined) updateFields['medicalHistory.$.doctor'] = updateData.doctor;

      return await PatientModel.findOneAndUpdate(
        { 
          _id: patientId, 
          'medicalHistory._id': recordId 
        },
        { 
          $set: updateFields
        },
        { new: true, session }
      ).populate('user', 'email firstName lastName')
       .populate('medicalHistory.doctor', 'firstName lastName email');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete medical record
   * @param {string} patientId - Patient ID
   * @param {string} recordId - Medical record ID
   * @param {Object} session - MongoDB session
   * @returns {Promise<Object>} - Updated patient
   */
  static async deleteMedicalRecord(patientId, recordId, session) {
    try {
      return await PatientModel.findByIdAndUpdate(
        patientId,
        { $pull: { medicalHistory: { _id: recordId } } },
        { new: true, session }
      ).populate('user', 'email firstName lastName')
       .populate('medicalHistory.doctor', 'firstName lastName email');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get patient medical history with filters
   * @param {string} patientId - Patient ID
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} - Medical history
   */
  static async getMedicalHistory(patientId, filters = {}) {
    try {
      const patient = await PatientModel.findById(patientId)
        .populate('medicalHistory.doctor', 'firstName lastName email')
        .select('medicalHistory');

      if (!patient) {
        return [];
      }

      let history = patient.medicalHistory;

      // Apply filters
      if (filters.recordType) {
        history = history.filter(record => record.recordType === filters.recordType);
      }

      if (filters.startDate && filters.endDate) {
        history = history.filter(record => 
          record.date >= new Date(filters.startDate) && 
          record.date <= new Date(filters.endDate)
        );
      }

      if (filters.doctorId) {
        history = history.filter(record => record.doctor.toString() === filters.doctorId);
      }

      // Sort by date (newest first)
      history.sort((a, b) => new Date(b.date) - new Date(a.date));

      return history;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update patient allergies
   * @param {string} patientId - Patient ID
   * @param {Array} allergies - Allergies array
   * @param {Object} session - MongoDB session
   * @returns {Promise<Object>} - Updated patient
   */
  static async updateAllergies(patientId, allergies, session) {
    try {
      return await PatientModel.findByIdAndUpdate(
        patientId,
        { $set: { allergies } },
        { new: true, session }
      ).populate('user', 'email firstName lastName');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update patient medications
   * @param {string} patientId - Patient ID
   * @param {Array} medications - Medications array
   * @param {Object} session - MongoDB session
   * @returns {Promise<Object>} - Updated patient
   */
  static async updateMedications(patientId, medications, session) {
    try {
      return await PatientModel.findByIdAndUpdate(
        patientId,
        { $set: { currentMedications: medications } },
        { new: true, session }
      ).populate('user', 'email firstName lastName')
       .populate('currentMedications.prescribedBy', 'firstName lastName email');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search patients
   * @param {Object} searchParams - Search parameters
   * @returns {Promise<Array>} - Search results
   */
  static async searchPatients(searchParams) {
    try {
      const query = {};

      if (searchParams.name) {
        query.$or = [
          { 'user.firstName': { $regex: searchParams.name, $options: 'i' } },
          { 'user.lastName': { $regex: searchParams.name, $options: 'i' } }
        ];
      }

      if (searchParams.healthCardNumber) {
        query.healthCardNumber = { $regex: searchParams.healthCardNumber, $options: 'i' };
      }

      if (searchParams.phone) {
        query.phone = { $regex: searchParams.phone, $options: 'i' };
      }

      if (searchParams.status) {
        query.status = searchParams.status;
      }

      const patients = await PatientModel.find(query)
        .populate('user', 'email firstName lastName')
        .limit(searchParams.limit || 50)
        .skip(searchParams.skip || 0)
        .sort({ createdAt: -1 });

      return patients;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get patient statistics
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} - Statistics
   */
  static async getPatientStats(filters = {}) {
    try {
      const matchQuery = {};

      if (filters.startDate && filters.endDate) {
        matchQuery.createdAt = {
          $gte: new Date(filters.startDate),
          $lte: new Date(filters.endDate)
        };
      }

      const stats = await PatientModel.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            totalPatients: { $sum: 1 },
            activePatients: {
              $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
            },
            inactivePatients: {
              $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] }
            },
            suspendedPatients: {
              $sum: { $cond: [{ $eq: ['$status', 'suspended'] }, 1, 0] }
            }
          }
        }
      ]);

      return stats[0] || {
        totalPatients: 0,
        activePatients: 0,
        inactivePatients: 0,
        suspendedPatients: 0
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add document to patient
   * @param {string} patientId - Patient ID
   * @param {Object} documentData - Document data
   * @param {Object} session - MongoDB session
   * @returns {Promise<Object>} - Updated patient
   */
  static async addDocument(patientId, documentData, session) {
    try {
      return await PatientModel.findByIdAndUpdate(
        patientId,
        { $push: { documents: documentData } },
        { new: true, session }
      ).populate('user', 'email firstName lastName')
       .populate('documents.uploadedBy', 'firstName lastName email');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get patient documents
   * @param {string} patientId - Patient ID
   * @returns {Promise<Array>} - Documents
   */
  static async getDocuments(patientId) {
    try {
      const patient = await PatientModel.findById(patientId)
        .populate('documents.uploadedBy', 'firstName lastName email')
        .select('documents');

      return patient ? patient.documents : [];
    } catch (error) {
      throw error;
    }
  }
}
