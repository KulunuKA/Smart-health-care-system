import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

class AnalyticsService {
  // Generate comprehensive analytics
  static async generateAnalytics(data) {
    try {
      const response = await api.post('/api/analytics/generate', data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to generate analytics');
    }
  }

  // Get analytics by ID
  static async getAnalyticsById(id) {
    try {
      const response = await api.get(`/api/analytics/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get analytics');
    }
  }

  // Get all analytics with pagination and filtering
  static async getAllAnalytics(params = {}) {
    try {
      const response = await api.get('/api/analytics', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get analytics');
    }
  }

  // Get dashboard summary
  static async getDashboardSummary() {
    try {
      const response = await api.get('/api/analytics/dashboard/summary');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get dashboard summary');
    }
  }

  // Delete analytics
  static async deleteAnalytics(id) {
    try {
      const response = await api.delete(`/api/analytics/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete analytics');
    }
  }

  // Helper method to format date range for API
  static formatDateRange(range) {
    const now = new Date();
    let startDate, endDate;

    switch (range) {
      case '7':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case '30':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case '90':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case '365':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        endDate = now;
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  }

  // Helper method to format analytics data for charts
  static formatChartData(analytics, chartType) {
    if (!analytics) return null;

    switch (chartType) {
      case 'patientDemographics':
        return {
          labels: Object.keys(analytics.patientMetrics?.genderDistribution || {}),
          datasets: [{
            data: Object.values(analytics.patientMetrics?.genderDistribution || {}),
            backgroundColor: ['#3B82F6', '#EC4899', '#10B981']
          }]
        };

      case 'appointmentStatus':
        return {
          labels: ['Scheduled', 'Confirmed', 'Completed', 'Cancelled'],
          datasets: [{
            data: [
              analytics.appointmentMetrics?.scheduledAppointments || 0,
              analytics.appointmentMetrics?.confirmedAppointments || 0,
              analytics.appointmentMetrics?.completedAppointments || 0,
              analytics.appointmentMetrics?.cancelledAppointments || 0
            ],
            backgroundColor: ['#F59E0B', '#3B82F6', '#10B981', '#EF4444']
          }]
        };

      case 'revenueTrend':
        return {
          labels: analytics.financialMetrics?.revenueByMonth?.map(item => item.month) || [],
          datasets: [{
            label: 'Revenue',
            data: analytics.financialMetrics?.revenueByMonth?.map(item => item.amount) || [],
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true
          }]
        };

      case 'doctorUtilization':
        return {
          labels: analytics.doctorMetrics?.doctorUtilization?.map(doc => doc.doctorName) || [],
          datasets: [{
            label: 'Appointments',
            data: analytics.doctorMetrics?.doctorUtilization?.map(doc => doc.appointmentCount) || [],
            backgroundColor: '#3B82F6'
          }]
        };

      default:
        return null;
    }
  }
}

export default AnalyticsService;
