import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../utils/constants';

/**
 * Payment Service
 * Handles all payment-related API calls
 */
class PaymentService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Get unpaid bills for patient
   * @param {string} patientId - Patient ID
   * @param {object} filters - Filter parameters
   * @returns {Promise<Array>} - Unpaid bills
   */
  async getUnpaidBills(patientId, filters = {}) {
    try {
      const response = await axios.get(
        `${this.baseURL}${API_ENDPOINTS.PAYMENTS.UNPAID}/${patientId}`,
        { params: filters }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch unpaid bills');
    }
  }

  /**
   * Get payment history for patient
   * @param {string} patientId - Patient ID
   * @param {object} filters - Filter parameters
   * @returns {Promise<Array>} - Payment history
   */
  async getPaymentHistory(patientId, filters = {}) {
    try {
      const response = await axios.get(
        `${this.baseURL}${API_ENDPOINTS.PAYMENTS.HISTORY}/${patientId}`,
        { params: filters }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch payment history');
    }
  }

  /**
   * Process payment
   * @param {object} paymentData - Payment data
   * @returns {Promise<object>} - Payment result
   */
  async processPayment(paymentData) {
    try {
      const response = await axios.post(
        `${this.baseURL}${API_ENDPOINTS.PAYMENTS.CONFIRM}`,
        paymentData
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Payment processing failed');
    }
  }

  /**
   * Get payment by ID
   * @param {string} paymentId - Payment ID
   * @returns {Promise<object>} - Payment details
   */
  async getPaymentById(paymentId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/payments/${paymentId}`
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch payment details');
    }
  }

  /**
   * Generate payment receipt
   * @param {string} paymentId - Payment ID
   * @returns {Promise<Blob>} - Receipt PDF blob
   */
  async generateReceipt(paymentId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/payments/${paymentId}/receipt`,
        { responseType: 'blob' }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to generate receipt');
    }
  }

  /**
   * Send receipt via email
   * @param {string} paymentId - Payment ID
   * @param {string} email - Email address
   * @returns {Promise<void>}
   */
  async sendReceiptByEmail(paymentId, email) {
    try {
      await axios.post(
        `${this.baseURL}/payments/${paymentId}/send-receipt`,
        { email }
      );
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send receipt');
    }
  }

  /**
   * Refund payment
   * @param {string} paymentId - Payment ID
   * @param {object} refundData - Refund data
   * @returns {Promise<object>} - Refund result
   */
  async refundPayment(paymentId, refundData) {
    try {
      const response = await axios.post(
        `${this.baseURL}/payments/${paymentId}/refund`,
        refundData
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Refund failed');
    }
  }

  /**
   * Get payment methods
   * @returns {Promise<Array>} - Available payment methods
   */
  async getPaymentMethods() {
    try {
      const response = await axios.get(
        `${this.baseURL}/payments/methods`
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch payment methods');
    }
  }

  /**
   * Validate payment method
   * @param {object} paymentMethodData - Payment method data
   * @returns {Promise<object>} - Validation result
   */
  async validatePaymentMethod(paymentMethodData) {
    try {
      const response = await axios.post(
        `${this.baseURL}/payments/validate-method`,
        paymentMethodData
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Payment method validation failed');
    }
  }

  /**
   * Get payment statistics
   * @param {object} filters - Filter parameters
   * @returns {Promise<object>} - Payment statistics
   */
  async getPaymentStats(filters = {}) {
    try {
      const response = await axios.get(
        `${this.baseURL}/payments/stats`,
        { params: filters }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch payment statistics');
    }
  }

  /**
   * Get payment summary
   * @param {string} patientId - Patient ID
   * @param {object} dateRange - Date range
   * @returns {Promise<object>} - Payment summary
   */
  async getPaymentSummary(patientId, dateRange = {}) {
    try {
      const response = await axios.get(
        `${this.baseURL}/payments/summary/${patientId}`,
        { params: dateRange }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch payment summary');
    }
  }

  /**
   * Create payment plan
   * @param {object} planData - Payment plan data
   * @returns {Promise<object>} - Created payment plan
   */
  async createPaymentPlan(planData) {
    try {
      const response = await axios.post(
        `${this.baseURL}/payments/plans`,
        planData
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create payment plan');
    }
  }

  /**
   * Get payment plans
   * @param {string} patientId - Patient ID
   * @returns {Promise<Array>} - Payment plans
   */
  async getPaymentPlans(patientId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/payments/plans/${patientId}`
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch payment plans');
    }
  }

  /**
   * Update payment plan
   * @param {string} planId - Payment plan ID
   * @param {object} updateData - Update data
   * @returns {Promise<object>} - Updated payment plan
   */
  async updatePaymentPlan(planId, updateData) {
    try {
      const response = await axios.put(
        `${this.baseURL}/payments/plans/${planId}`,
        updateData
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update payment plan');
    }
  }

  /**
   * Cancel payment plan
   * @param {string} planId - Payment plan ID
   * @returns {Promise<void>}
   */
  async cancelPaymentPlan(planId) {
    try {
      await axios.delete(`${this.baseURL}/payments/plans/${planId}`);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to cancel payment plan');
    }
  }
}

export const paymentService = new PaymentService();