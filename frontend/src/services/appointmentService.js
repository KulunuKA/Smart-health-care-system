import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../utils/constants';

/**
 * Appointment Service
 * Handles all appointment-related API calls
 */
class AppointmentService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Get available appointments
   * @param {object} filters - Filter parameters
   * @returns {Promise<Array>} - Available appointments
   */
  async getAvailableAppointments(filters = {}) {
    try {
      const response = await axios.get(
        `${this.baseURL}${API_ENDPOINTS.APPOINTMENTS.AVAILABLE}`,
        { params: filters }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch available appointments');
    }
  }

  /**
   * Get user's appointments
   * @param {string} userId - User ID
   * @param {object} filters - Filter parameters
   * @returns {Promise<Array>} - User appointments
   */
  async getUserAppointments(userId, filters = {}) {
    try {
      const response = await axios.get(
        `${this.baseURL}${API_ENDPOINTS.APPOINTMENTS.USER}/${userId}`,
        { params: filters }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user appointments');
    }
  }

  /**
   * Get appointment by ID
   * @param {string} appointmentId - Appointment ID
   * @returns {Promise<object>} - Appointment details
   */
  async getAppointmentById(appointmentId) {
    try {
      const response = await axios.get(
        `${this.baseURL}${API_ENDPOINTS.APPOINTMENTS.BASE}/${appointmentId}`
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch appointment');
    }
  }

  /**
   * Book new appointment
   * @param {object} appointmentData - Appointment data
   * @returns {Promise<object>} - Created appointment
   */
  async bookAppointment(appointmentData) {
    try {
      const response = await axios.post(
        `${this.baseURL}${API_ENDPOINTS.APPOINTMENTS.BOOK}`,
        appointmentData
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to book appointment');
    }
  }

  /**
   * Update appointment
   * @param {string} appointmentId - Appointment ID
   * @param {object} updateData - Update data
   * @returns {Promise<object>} - Updated appointment
   */
  async updateAppointment(appointmentId, updateData) {
    try {
      const response = await axios.put(
        `${this.baseURL}${API_ENDPOINTS.APPOINTMENTS.UPDATE}/${appointmentId}`,
        updateData
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update appointment');
    }
  }

  /**
   * Cancel appointment
   * @param {string} appointmentId - Appointment ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise<void>}
   */
  async cancelAppointment(appointmentId, reason) {
    try {
      await axios.delete(
        `${this.baseURL}${API_ENDPOINTS.APPOINTMENTS.BASE}/${appointmentId}`,
        { data: { reason } }
      );
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to cancel appointment');
    }
  }

  /**
   * Reschedule appointment
   * @param {string} appointmentId - Appointment ID
   * @param {object} newSchedule - New schedule data
   * @returns {Promise<object>} - Rescheduled appointment
   */
  async rescheduleAppointment(appointmentId, newSchedule) {
    try {
      const response = await axios.put(
        `${this.baseURL}${API_ENDPOINTS.APPOINTMENTS.UPDATE}/${appointmentId}`,
        { ...newSchedule, action: 'reschedule' }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to reschedule appointment');
    }
  }

  /**
   * Confirm appointment
   * @param {string} appointmentId - Appointment ID
   * @returns {Promise<object>} - Confirmed appointment
   */
  async confirmAppointment(appointmentId) {
    try {
      const response = await axios.put(
        `${this.baseURL}${API_ENDPOINTS.APPOINTMENTS.UPDATE}/${appointmentId}`,
        { status: 'confirmed' }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to confirm appointment');
    }
  }

  /**
   * Get available time slots for a doctor and date
   * @param {string} doctorId - Doctor ID
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise<Array>} - Available time slots
   */
  async getAvailableTimeSlots(doctorId, date) {
    try {
      const response = await axios.get(
        `${this.baseURL}${API_ENDPOINTS.APPOINTMENTS.AVAILABLE}/slots`,
        { 
          params: { 
            doctorId, 
            date 
          } 
        }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch available time slots');
    }
  }

  /**
   * Get patients list
   * @returns {Promise<Array>} - Patients list
   */
  async getPatients() {
    try {
      const response = await axios.get(
        `${this.baseURL}${API_ENDPOINTS.PATIENTS.LIST}`
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch patients');
    }
  }

  /**
   * Get doctors list
   * @param {object} filters - Filter parameters
   * @returns {Promise<Array>} - Doctors list
   */
  async getDoctors(filters = {}) {
    try {
      const response = await axios.get(
        `${this.baseURL}/doctors`,
        { params: filters }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch doctors');
    }
  }

  /**
   * Get doctor by ID
   * @param {string} doctorId - Doctor ID
   * @returns {Promise<object>} - Doctor details
   */
  async getDoctorById(doctorId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/doctors/${doctorId}`
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch doctor details');
    }
  }

  /**
   * Get appointment statistics
   * @param {object} filters - Filter parameters
   * @returns {Promise<object>} - Appointment statistics
   */
  async getAppointmentStats(filters = {}) {
    try {
      const response = await axios.get(
        `${this.baseURL}${API_ENDPOINTS.APPOINTMENTS.BASE}/stats`,
        { params: filters }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch appointment statistics');
    }
  }

  /**
   * Search appointments
   * @param {object} searchParams - Search parameters
   * @returns {Promise<Array>} - Search results
   */
  async searchAppointments(searchParams) {
    try {
      const response = await axios.get(
        `${this.baseURL}${API_ENDPOINTS.APPOINTMENTS.BASE}/search`,
        { params: searchParams }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to search appointments');
    }
  }

  /**
   * Get all appointments (Admin only)
   * @param {object} filters - Filter parameters
   * @returns {Promise<object>} - All appointments with pagination
   */
  async getAllAppointments(filters = {}) {
    try {
      const response = await axios.get(
        `${this.baseURL}${API_ENDPOINTS.ADMIN.APPOINTMENTS}`,
        { params: filters }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch all appointments');
    }
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise<object>} - User details
   */
  async getUserById(userId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/user/${userId}`
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user details');
    }
  }

  /**
   * Get medical history for a patient
   * @param {string} patientId - Patient ID
   * @param {object} filters - Filter parameters
   * @returns {Promise<object>} - Medical history
   */
  async getMedicalHistory(patientId, filters = {}) {
    try {
      const response = await axios.get(
        `${this.baseURL}/${patientId}/history`,
        { params: filters }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch medical history');
    }
  }

  /**
   * Add medical record for a patient
   * @param {string} patientId - Patient ID
   * @param {object} recordData - Medical record data
   * @returns {Promise<object>} - Added medical record
   */
  async addMedicalRecord(patientId, recordData) {
    try {
      const response = await axios.post(
        `${this.baseURL}/${patientId}/records`,
        recordData
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add medical record');
    }
  }

  /**
   * Update medical record for a patient
   * @param {string} patientId - Patient ID
   * @param {string} recordId - Medical record ID
   * @param {object} updateData - Medical record update data
   * @returns {Promise<object>} - Updated medical record
   */
  async updateMedicalRecord(patientId, recordId, updateData) {
    try {
      const response = await axios.put(
        `${this.baseURL}/${patientId}/records/${recordId}`,
        updateData
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update medical record');
    }
  }

  /**
   * Get appointment statistics (Admin only)
   * @param {object} filters - Filter parameters
   * @returns {Promise<object>} - Appointment statistics
   */
  async getAdminAppointmentStats(filters = {}) {
    try {
      const response = await axios.get(
        `${this.baseURL}${API_ENDPOINTS.ADMIN.APPOINTMENTS_STATS}`,
        { params: filters }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch appointment statistics');
    }
  }
}

export const appointmentService = new AppointmentService();