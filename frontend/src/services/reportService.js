import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../utils/constants';

/**
 * Report Service
 * Handles all reporting and analytics API calls
 */
class ReportService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Get overview report
   * @param {object} filters - Filter parameters
   * @returns {Promise<object>} - Overview report data
   */
  async getOverviewReport(filters = {}) {
    try {
      const response = await axios.get(
        `${this.baseURL}${API_ENDPOINTS.REPORTS.OVERVIEW}`,
        { params: filters }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch overview report');
    }
  }

  /**
   * Get revenue report
   * @param {object} filters - Filter parameters
   * @returns {Promise<object>} - Revenue report data
   */
  async getRevenueReport(filters = {}) {
    try {
      const response = await axios.get(
        `${this.baseURL}${API_ENDPOINTS.REPORTS.REVENUE}`,
        { params: filters }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch revenue report');
    }
  }

  /**
   * Get patient flow report
   * @param {object} filters - Filter parameters
   * @returns {Promise<object>} - Patient flow report data
   */
  async getPatientFlowReport(filters = {}) {
    try {
      const response = await axios.get(
        `${this.baseURL}/reports/patient-flow`,
        { params: filters }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch patient flow report');
    }
  }

  /**
   * Get staff utilization report
   * @param {object} filters - Filter parameters
   * @returns {Promise<object>} - Staff utilization report data
   */
  async getStaffUtilizationReport(filters = {}) {
    try {
      const response = await axios.get(
        `${this.baseURL}/reports/staff-utilization`,
        { params: filters }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch staff utilization report');
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
        `${this.baseURL}/reports/appointment-stats`,
        { params: filters }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch appointment statistics');
    }
  }

  /**
   * Get financial summary
   * @param {object} filters - Filter parameters
   * @returns {Promise<object>} - Financial summary
   */
  async getFinancialSummary(filters = {}) {
    try {
      const response = await axios.get(
        `${this.baseURL}/reports/financial-summary`,
        { params: filters }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch financial summary');
    }
  }

  /**
   * Get department performance
   * @param {object} filters - Filter parameters
   * @returns {Promise<object>} - Department performance data
   */
  async getDepartmentPerformance(filters = {}) {
    try {
      const response = await axios.get(
        `${this.baseURL}/reports/department-performance`,
        { params: filters }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch department performance');
    }
  }

  /**
   * Get patient demographics
   * @param {object} filters - Filter parameters
   * @returns {Promise<object>} - Patient demographics data
   */
  async getPatientDemographics(filters = {}) {
    try {
      const response = await axios.get(
        `${this.baseURL}/reports/patient-demographics`,
        { params: filters }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch patient demographics');
    }
  }

  /**
   * Get treatment outcomes
   * @param {object} filters - Filter parameters
   * @returns {Promise<object>} - Treatment outcomes data
   */
  async getTreatmentOutcomes(filters = {}) {
    try {
      const response = await axios.get(
        `${this.baseURL}/reports/treatment-outcomes`,
        { params: filters }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch treatment outcomes');
    }
  }

  /**
   * Export report as PDF
   * @param {string} reportType - Type of report to export
   * @param {object} filters - Filter parameters
   * @returns {Promise<Blob>} - PDF blob
   */
  async exportReportPDF(reportType, filters = {}) {
    try {
      const response = await axios.get(
        `${this.baseURL}/reports/export/${reportType}/pdf`,
        { 
          params: filters,
          responseType: 'blob'
        }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to export report as PDF');
    }
  }

  /**
   * Export report as CSV
   * @param {string} reportType - Type of report to export
   * @param {object} filters - Filter parameters
   * @returns {Promise<Blob>} - CSV blob
   */
  async exportReportCSV(reportType, filters = {}) {
    try {
      const response = await axios.get(
        `${this.baseURL}/reports/export/${reportType}/csv`,
        { 
          params: filters,
          responseType: 'blob'
        }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to export report as CSV');
    }
  }

  /**
   * Get report templates
   * @returns {Promise<Array>} - Available report templates
   */
  async getReportTemplates() {
    try {
      const response = await axios.get(
        `${this.baseURL}/reports/templates`
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch report templates');
    }
  }

  /**
   * Create custom report
   * @param {object} reportConfig - Report configuration
   * @returns {Promise<object>} - Created custom report
   */
  async createCustomReport(reportConfig) {
    try {
      const response = await axios.post(
        `${this.baseURL}/reports/custom`,
        reportConfig
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create custom report');
    }
  }

  /**
   * Get report schedule
   * @returns {Promise<Array>} - Scheduled reports
   */
  async getReportSchedule() {
    try {
      const response = await axios.get(
        `${this.baseURL}/reports/schedule`
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch report schedule');
    }
  }

  /**
   * Schedule report
   * @param {object} scheduleData - Schedule data
   * @returns {Promise<object>} - Scheduled report
   */
  async scheduleReport(scheduleData) {
    try {
      const response = await axios.post(
        `${this.baseURL}/reports/schedule`,
        scheduleData
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to schedule report');
    }
  }

  /**
   * Get dashboard widgets
   * @param {string} role - User role
   * @returns {Promise<Array>} - Dashboard widgets
   */
  async getDashboardWidgets(role) {
    try {
      const response = await axios.get(
        `${this.baseURL}/reports/dashboard-widgets`,
        { params: { role } }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard widgets');
    }
  }

  /**
   * Get real-time metrics
   * @returns {Promise<object>} - Real-time metrics
   */
  async getRealTimeMetrics() {
    try {
      const response = await axios.get(
        `${this.baseURL}/reports/real-time-metrics`
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch real-time metrics');
    }
  }
}

export const reportService = new ReportService();