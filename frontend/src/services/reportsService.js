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

class ReportsService {
  // Generate a new report
  static async generateReport(data) {
    try {
      const response = await api.post('/api/api/reports/generate', data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to generate report');
    }
  }

  // Get report by ID
  static async getReportById(id) {
    try {
      const response = await api.get(`/api/reports/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get report');
    }
  }

  // Get all reports with pagination and filtering
  static async getAllReports(params = {}) {
    try {
      const response = await api.get('/reports', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get reports');
    }
  }

  // Update report
  static async updateReport(id, data) {
    try {
      const response = await api.put(`/api/reports/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update report');
    }
  }

  // Delete report
  static async deleteReport(id) {
    try {
      const response = await api.delete(`/api/reports/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete report');
    }
  }

  // Export report
  static async exportReport(id, format = 'json') {
    try {
      const response = await api.get(`/api/reports/${id}/export`, {
        params: { format },
        responseType: format === 'json' ? 'json' : 'blob'
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to export report');
    }
  }

  // Get report templates
  static async getReportTemplates() {
    try {
      const response = await api.get('/api/reports/templates/list');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get report templates');
    }
  }

  // Create report template
  static async createReportTemplate(data) {
    try {
      const response = await api.post('/api/reports/templates/create', data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create report template');
    }
  }

  // Helper method to format report parameters
  static formatReportParameters(params) {
    const {
      reportType,
      dateRange,
      filters = {},
      groupBy,
      sortBy
    } = params;

    return {
      reportType,
      parameters: {
        dateRange: {
          startDate: dateRange?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: dateRange?.endDate || new Date().toISOString().split('T')[0]
        },
        filters: {
          doctorId: filters.doctorId || null,
          patientId: filters.patientId || null,
          status: filters.status || null,
          department: filters.department || null,
          ageRange: filters.ageRange || null,
          gender: filters.gender || null
        },
        groupBy: groupBy || 'month',
        sortBy: {
          field: sortBy?.field || 'date',
          order: sortBy?.order || 'desc'
        }
      }
    };
  }

  // Helper method to download file
  static downloadFile(data, filename, type) {
    const blob = new Blob([data], { type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // Helper method to format report data for display
  static formatReportData(report) {
    if (!report || !report.content) return null;

    const content = report.content;
    
    return {
      summary: content.summary || {},
      charts: this.extractChartsFromContent(content),
      tables: this.extractTablesFromContent(content),
      insights: this.generateInsights(content)
    };
  }

  // Extract chart data from report content
  static extractChartsFromContent(content) {
    const charts = [];

    // Patient demographics chart
    if (content.genderDistribution) {
      charts.push({
        type: 'doughnut',
        title: 'Patient Gender Distribution',
        data: {
          labels: Object.keys(content.genderDistribution),
          datasets: [{
            data: Object.values(content.genderDistribution),
            backgroundColor: ['#3B82F6', '#EC4899', '#10B981']
          }]
        }
      });
    }

    // Age group distribution chart
    if (content.ageGroupDistribution) {
      charts.push({
        type: 'bar',
        title: 'Age Group Distribution',
        data: {
          labels: Object.keys(content.ageGroupDistribution),
          datasets: [{
            label: 'Patients',
            data: Object.values(content.ageGroupDistribution),
            backgroundColor: '#3B82F6'
          }]
        }
      });
    }

    // Revenue trend chart
    if (content.revenueByMonth) {
      charts.push({
        type: 'line',
        title: 'Revenue Trend',
        data: {
          labels: content.revenueByMonth.map(item => item.month),
          datasets: [{
            label: 'Revenue',
            data: content.revenueByMonth.map(item => item.amount),
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true
          }]
        }
      });
    }

    return charts;
  }

  // Extract table data from report content
  static extractTablesFromContent(content) {
    const tables = [];

    // Patients table
    if (content.patients) {
      tables.push({
        title: 'Patient Details',
        headers: ['Name', 'Email', 'Gender', 'Age', 'Status'],
        rows: content.patients.map(patient => [
          patient.name,
          patient.email,
          patient.gender,
          patient.age,
          patient.status
        ])
      });
    }

    // Appointments table
    if (content.appointments) {
      tables.push({
        title: 'Appointment Details',
        headers: ['Patient', 'Doctor', 'Date', 'Time', 'Reason', 'Status'],
        rows: content.appointments.map(appointment => [
          appointment.patient,
          appointment.doctor,
          new Date(appointment.date).toLocaleDateString(),
          appointment.time,
          appointment.reason,
          appointment.status
        ])
      });
    }

    // Bills table
    if (content.bills) {
      tables.push({
        title: 'Financial Details',
        headers: ['Patient', 'Doctor', 'Amount', 'Status', 'Date'],
        rows: content.bills.map(bill => [
          bill.patient,
          bill.doctor,
          `$${bill.amount}`,
          bill.status,
          new Date(bill.date).toLocaleDateString()
        ])
      });
    }

    return tables;
  }

  // Generate insights from report content
  static generateInsights(content) {
    const insights = [];

    // Patient insights
    if (content.summary) {
      const { totalPatients, newPatients, activePatients } = content.summary;
      
      if (totalPatients > 0) {
        const growthRate = newPatients > 0 ? ((newPatients / totalPatients) * 100).toFixed(1) : 0;
        insights.push({
          type: 'success',
          title: 'Patient Growth',
          message: `Patient base grew by ${growthRate}% this period with ${newPatients} new registrations.`
        });
      }

      if (activePatients > 0) {
        const retentionRate = ((activePatients / totalPatients) * 100).toFixed(1);
        insights.push({
          type: 'info',
          title: 'Patient Retention',
          message: `${retentionRate}% of patients are actively using the system.`
        });
      }
    }

    // Financial insights
    if (content.summary?.totalRevenue > 0) {
      const avgBill = content.summary.averageBillAmount || 0;
      insights.push({
        type: 'success',
        title: 'Revenue Performance',
        message: `Average bill amount is $${avgBill.toFixed(2)} with strong revenue growth.`
      });
    }

    // Appointment insights
    if (content.summary?.totalAppointments > 0) {
      const completionRate = content.summary.completedAppointments > 0 ? 
        ((content.summary.completedAppointments / content.summary.totalAppointments) * 100).toFixed(1) : 0;
      
      insights.push({
        type: completionRate > 80 ? 'success' : 'warning',
        title: 'Appointment Completion',
        message: `${completionRate}% of appointments were completed successfully.`
      });
    }

    return insights;
  }

  // Report type options
  static getReportTypes() {
    return [
      { value: 'patient_summary', label: 'Patient Summary', description: 'Comprehensive patient analysis and demographics' },
      { value: 'appointment_summary', label: 'Appointment Summary', description: 'Appointment patterns and scheduling insights' },
      { value: 'financial_summary', label: 'Financial Summary', description: 'Revenue, payments, and financial performance' },
      { value: 'doctor_performance', label: 'Doctor Performance', description: 'Individual doctor performance metrics' },
      { value: 'medical_trends', label: 'Medical Trends', description: 'Medical patterns, diagnoses, and treatments' },
      { value: 'system_usage', label: 'System Usage', description: 'System performance and user activity' },
      { value: 'custom', label: 'Custom Report', description: 'Customized report with specific parameters' }
    ];
  }

  // Export format options
  static getExportFormats() {
    return [
      { value: 'json', label: 'JSON', description: 'Structured data format' },
      { value: 'csv', label: 'CSV', description: 'Comma-separated values' },
      { value: 'pdf', label: 'PDF', description: 'Portable document format' },
      { value: 'excel', label: 'Excel', description: 'Microsoft Excel format' }
    ];
  }
}

export default ReportsService;
