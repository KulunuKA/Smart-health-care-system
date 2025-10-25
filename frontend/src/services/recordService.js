import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../utils/constants';

/**
 * Patient Record Service
 * Handles all patient record-related API calls
 */
class RecordService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Get patient by ID
   * @param {string} patientId - Patient ID
   * @returns {Promise<object>} - Patient details
   */
  async getPatientById(patientId) {
    try {
      const response = await axios.get(
        `${this.baseURL}${API_ENDPOINTS.PATIENTS.BASE}/${patientId}`
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch patient details');
    }
  }

  /**
   * Get patient by health card number
   * @param {string} healthCardNumber - Health card number
   * @returns {Promise<object>} - Patient details
   */
  async getPatientByHealthCard(healthCardNumber) {
    try {
      const response = await axios.get(
        `${this.baseURL}${API_ENDPOINTS.PATIENTS.BASE}/health-card/${healthCardNumber}`
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch patient by health card');
    }
  }

  /**
   * Update patient record
   * @param {string} patientId - Patient ID
   * @param {object} updateData - Update data
   * @returns {Promise<object>} - Updated patient record
   */
  async updatePatientRecord(patientId, updateData) {
    try {
      const response = await axios.put(
        `${this.baseURL}${API_ENDPOINTS.PATIENTS.UPDATE}/${patientId}`,
        updateData
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update patient record');
    }
  }

  /**
   * Get patient medical history
   * @param {string} patientId - Patient ID
   * @param {object} filters - Filter parameters
   * @returns {Promise<Array>} - Medical history
   */
  async getMedicalHistory(patientId, filters = {}) {
    try {
      const response = await axios.get(
        `${this.baseURL}${API_ENDPOINTS.PATIENTS.BASE}/${patientId}/history`,
        { params: filters }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch medical history');
    }
  }

  /**
   * Add medical record entry
   * @param {string} patientId - Patient ID
   * @param {object} recordData - Record data
   * @returns {Promise<object>} - Created record entry
   */
  async addMedicalRecord(patientId, recordData) {
    try {
      const response = await axios.post(
        `${this.baseURL}${API_ENDPOINTS.PATIENTS.BASE}/${patientId}/records`,
        recordData
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add medical record');
    }
  }

  /**
   * Update medical record entry
   * @param {string} recordId - Record ID
   * @param {object} updateData - Update data
   * @returns {Promise<object>} - Updated record entry
   */
  async updateMedicalRecord(recordId, updateData) {
    try {
      const response = await axios.put(
        `${this.baseURL}/records/${recordId}`,
        updateData
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update medical record');
    }
  }

  /**
   * Delete medical record entry
   * @param {string} recordId - Record ID
   * @returns {Promise<void>}
   */
  async deleteMedicalRecord(recordId) {
    try {
      await axios.delete(`${this.baseURL}/records/${recordId}`);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete medical record');
    }
  }

  /**
   * Get patient allergies
   * @param {string} patientId - Patient ID
   * @returns {Promise<Array>} - Patient allergies
   */
  async getPatientAllergies(patientId) {
    try {
      const response = await axios.get(
        `${this.baseURL}${API_ENDPOINTS.PATIENTS.BASE}/${patientId}/allergies`
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch patient allergies');
    }
  }

  /**
   * Update patient allergies
   * @param {string} patientId - Patient ID
   * @param {Array} allergies - Allergies list
   * @returns {Promise<Array>} - Updated allergies
   */
  async updatePatientAllergies(patientId, allergies) {
    try {
      const response = await axios.put(
        `${this.baseURL}${API_ENDPOINTS.PATIENTS.BASE}/${patientId}/allergies`,
        { allergies }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update patient allergies');
    }
  }

  /**
   * Get patient medications
   * @param {string} patientId - Patient ID
   * @returns {Promise<Array>} - Patient medications
   */
  async getPatientMedications(patientId) {
    try {
      const response = await axios.get(
        `${this.baseURL}${API_ENDPOINTS.PATIENTS.BASE}/${patientId}/medications`
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch patient medications');
    }
  }

  /**
   * Update patient medications
   * @param {string} patientId - Patient ID
   * @param {Array} medications - Medications list
   * @returns {Promise<Array>} - Updated medications
   */
  async updatePatientMedications(patientId, medications) {
    try {
      const response = await axios.put(
        `${this.baseURL}${API_ENDPOINTS.PATIENTS.BASE}/${patientId}/medications`,
        { medications }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update patient medications');
    }
  }

  /**
   * Search patients
   * @param {object} searchParams - Search parameters
   * @returns {Promise<Array>} - Search results
   */
  async searchPatients(searchParams) {
    try {
      const response = await axios.get(
        `${this.baseURL}${API_ENDPOINTS.PATIENTS.BASE}/search`,
        { params: searchParams }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to search patients');
    }
  }

  /**
   * Get patient statistics
   * @param {object} filters - Filter parameters
   * @returns {Promise<object>} - Patient statistics
   */
  async getPatientStats(filters = {}) {
    try {
      const response = await axios.get(
        `${this.baseURL}${API_ENDPOINTS.PATIENTS.BASE}/stats`,
        { params: filters }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch patient statistics');
    }
  }

  /**
   * Upload patient document
   * @param {string} patientId - Patient ID
   * @param {FormData} fileData - File data
   * @returns {Promise<object>} - Upload result
   */
  async uploadPatientDocument(patientId, fileData) {
    try {
      const response = await axios.post(
        `${this.baseURL}${API_ENDPOINTS.PATIENTS.BASE}/${patientId}/documents`,
        fileData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to upload document');
    }
  }

  /**
   * Get patient documents
   * @param {string} patientId - Patient ID
   * @returns {Promise<Array>} - Patient documents
   */
  async getPatientDocuments(patientId) {
    try {
      const response = await axios.get(
        `${this.baseURL}${API_ENDPOINTS.PATIENTS.BASE}/${patientId}/documents`
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch patient documents');
    }
  }

  /**
   * Download patient document
   * @param {string} documentId - Document ID
   * @returns {Promise<Blob>} - Document blob
   */
  async downloadPatientDocument(documentId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/documents/${documentId}/download`,
        { responseType: 'blob' }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to download document');
    }
  }
}

export const recordService = new RecordService();