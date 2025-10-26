import { ReportModel } from './reportModel.js';
import { AnalyticsModel } from '../analytics/analyticsModel.js';
import { PatientModel } from '../patient/patientModel.js';
import { AppointmentModel } from '../appointments/appointmentModel.js';
import { BillModel } from '../payment/billModel.js';
import { UserModel } from '../user/userModel.js';
import { ResponseHandler } from '../../utils/ResponseHandler.js';
import fs from 'fs';
import path from 'path';

class ReportsController {
  // Generate a new report
  async generateReport(req, res) {
    try {
      const {
        title,
        description,
        reportType,
        parameters,
        format = 'json',
        accessLevel = 'private',
        allowedRoles = [],
        allowedUsers = [],
        tags = [],
        category,
        priority = 'medium',
        isTemplate = false,
        recurrence = 'none'
      } = req.body;

      // Handle authentication - use a default user ID if not authenticated
      const userId = req.user?._id || '000000000000000000000000'; // Default ObjectId

      // Validate required fields
      if (!title || !reportType) {
        return ResponseHandler.sendError(res, 'Title and report type are required', 400);
      }

      // Create report record
      const report = new ReportModel({
        title,
        description,
        reportType,
        parameters,
        format,
        accessLevel,
        allowedRoles,
        allowedUsers,
        tags,
        category,
        priority,
        isTemplate,
        recurrence,
        createdBy: userId,
        status: 'pending'
      });

      await report.save();

      // Generate report content based on type
      const content = await this.generateReportContent(reportType, parameters);
      report.content = content;
      report.status = 'completed';
      report.generatedAt = new Date();

      // Set expiration date
      report.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

      await report.save();

      return ResponseHandler.sendSuccess(res, report, 'Report generated successfully');
    } catch (error) {
      console.error('Error generating report:', error);
      return ResponseHandler.sendError(res, 'Failed to generate report', 500);
    }
  }

  // Generate report content based on type
  async generateReportContent(reportType, parameters) {
    try {
      const { dateRange, filters = {}, groupBy, sortBy } = parameters || {};
      const startDate = dateRange?.startDate ? new Date(dateRange.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = dateRange?.endDate ? new Date(dateRange.endDate) : new Date();

      switch (reportType) {
        case 'patient_summary':
          return await this.generatePatientSummaryReport(startDate, endDate, filters);
        case 'appointment_summary':
          return await this.generateAppointmentSummaryReport(startDate, endDate, filters);
        case 'financial_summary':
          return await this.generateFinancialSummaryReport(startDate, endDate, filters);
        case 'doctor_performance':
          return await this.generateDoctorPerformanceReport(startDate, endDate, filters);
        case 'medical_trends':
          return await this.generateMedicalTrendsReport(startDate, endDate, filters);
        case 'system_usage':
          return await this.generateSystemUsageReport(startDate, endDate, filters);
        default:
          return await this.generateCustomReport(startDate, endDate, filters);
      }
    } catch (error) {
      console.error('Error generating report content:', error);
      throw error;
    }
  }

  // Generate patient summary report
  async generatePatientSummaryReport(startDate, endDate, filters) {
    const query = { createdAt: { $gte: startDate, $lte: endDate } };
    
    if (filters.doctorId) {
      query['medicalHistory.doctor'] = filters.doctorId;
    }
    if (filters.gender) {
      query.gender = filters.gender;
    }
    if (filters.ageRange) {
      const now = new Date();
      if (filters.ageRange.min) {
        query.dateOfBirth = { $lte: new Date(now.getFullYear() - filters.ageRange.min, now.getMonth(), now.getDate()) };
      }
      if (filters.ageRange.max) {
        query.dateOfBirth = { $gte: new Date(now.getFullYear() - filters.ageRange.max, now.getMonth(), now.getDate()) };
      }
    }

    const patients = await PatientModel.find(query).populate('user', 'firstName lastName email');
    
    const totalPatients = patients.length;
    const newPatients = await PatientModel.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } });
    const activePatients = await PatientModel.countDocuments({ 
      status: 'active',
      lastVisit: { $gte: startDate, $lte: endDate }
    });

    // Gender distribution
    const genderDistribution = await PatientModel.aggregate([
      { $match: query },
      { $group: { _id: '$gender', count: { $sum: 1 } } }
    ]);

    // Age group distribution
    const ageGroupDistribution = await PatientModel.aggregate([
      { $match: query },
      {
        $addFields: {
          age: {
            $divide: [
              { $subtract: [new Date(), '$dateOfBirth'] },
              365 * 24 * 60 * 60 * 1000
            ]
          }
        }
      },
      {
        $bucket: {
          groupBy: '$age',
          boundaries: [0, 18, 35, 50, 65, 100],
          default: '65+',
          output: {
            count: { $sum: 1 },
            patients: { $push: { name: { $concat: ['$user.firstName', ' ', '$user.lastName'] }, age: '$age' } }
          }
        }
      }
    ]);

    return {
      summary: {
        totalPatients,
        newPatients,
        activePatients,
        period: { startDate, endDate }
      },
      genderDistribution,
      ageGroupDistribution,
      patients: patients.map(patient => ({
        id: patient._id,
        name: `${patient.user.firstName} ${patient.user.lastName}`,
        email: patient.user.email,
        gender: patient.gender,
        age: patient.age,
        healthCardNumber: patient.healthCardNumber,
        lastVisit: patient.lastVisit,
        status: patient.status
      }))
    };
  }

  // Generate appointment summary report
  async generateAppointmentSummaryReport(startDate, endDate, filters) {
    const query = { date: { $gte: startDate, $lte: endDate } };
    
    if (filters.doctorId) {
      query.doctorId = filters.doctorId;
    }
    if (filters.status) {
      query.status = filters.status;
    }

    const appointments = await AppointmentModel.find(query)
      .populate('userId', 'firstName lastName email')
      .populate('doctorId', 'firstName lastName email');

    const totalAppointments = appointments.length;
    const statusDistribution = await AppointmentModel.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Peak hours analysis
    const peakHours = await AppointmentModel.aggregate([
      { $match: query },
      { $group: { _id: { $hour: '$date' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Appointment reasons
    const appointmentReasons = await AppointmentModel.aggregate([
      { $match: query },
      { $group: { _id: '$reason', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    return {
      summary: {
        totalAppointments,
        period: { startDate, endDate }
      },
      statusDistribution,
      peakHours,
      appointmentReasons,
      appointments: appointments.map(appointment => ({
        id: appointment._id,
        patient: `${appointment.userId.firstName} ${appointment.userId.lastName}`,
        doctor: `${appointment.doctorId.firstName} ${appointment.doctorId.lastName}`,
        date: appointment.date,
        time: appointment.time,
        reason: appointment.reason,
        status: appointment.status,
        notes: appointment.notes
      }))
    };
  }

  // Generate financial summary report
  async generateFinancialSummaryReport(startDate, endDate, filters) {
    const query = { date: { $gte: startDate, $lte: endDate } };
    
    if (filters.doctorId) {
      query.doctorId = filters.doctorId;
    }
    if (filters.status) {
      query.status = filters.status;
    }

    const bills = await BillModel.find(query)
      .populate('userId', 'firstName lastName email')
      .populate('doctorId', 'firstName lastName email')
      .populate('appointmentId', 'reason');

    const totalRevenue = bills.reduce((sum, bill) => sum + bill.amount, 0);
    const paidBills = bills.filter(bill => bill.status === 'paid');
    const unpaidBills = bills.filter(bill => bill.status === 'unpaid');
    const overdueBills = bills.filter(bill => bill.status === 'overdue');

    const statusDistribution = await BillModel.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } }
    ]);

    const paymentMethodDistribution = await BillModel.aggregate([
      { $match: { ...query, status: 'paid' } },
      { $group: { _id: '$paymentMethod', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } }
    ]);

    // Revenue by month
    const revenueByMonth = await BillModel.aggregate([
      { $match: { ...query, status: 'paid' } },
      {
        $group: {
          _id: {
            month: { $month: '$date' },
            year: { $year: '$date' }
          },
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    return {
      summary: {
        totalRevenue,
        totalBills: bills.length,
        paidBills: paidBills.length,
        unpaidBills: unpaidBills.length,
        overdueBills: overdueBills.length,
        averageBillAmount: bills.length > 0 ? totalRevenue / bills.length : 0,
        period: { startDate, endDate }
      },
      statusDistribution,
      paymentMethodDistribution,
      revenueByMonth,
      bills: bills.map(bill => ({
        id: bill._id,
        patient: `${bill.userId.firstName} ${bill.userId.lastName}`,
        doctor: `${bill.doctorId.firstName} ${bill.doctorId.lastName}`,
        appointmentReason: bill.appointmentId?.reason,
        amount: bill.amount,
        status: bill.status,
        paymentMethod: bill.paymentMethod,
        date: bill.date,
        paidAt: bill.paidAt
      }))
    };
  }

  // Generate doctor performance report
  async generateDoctorPerformanceReport(startDate, endDate, filters) {
    const doctors = await UserModel.find({ role: 'Doctor' }, 'firstName lastName email');

    const doctorPerformance = await Promise.all(
      doctors.map(async (doctor) => {
        const appointments = await AppointmentModel.find({
          doctorId: doctor._id,
          date: { $gte: startDate, $lte: endDate }
        });

        const bills = await BillModel.find({
          doctorId: doctor._id,
          date: { $gte: startDate, $lte: endDate }
        });

        const totalRevenue = bills.reduce((sum, bill) => sum + bill.amount, 0);
        const completedAppointments = appointments.filter(apt => apt.status === 'completed').length;
        const cancelledAppointments = appointments.filter(apt => apt.status === 'cancelled').length;
        const completionRate = appointments.length > 0 ? (completedAppointments / appointments.length) * 100 : 0;

        return {
          doctorId: doctor._id,
          doctorName: `${doctor.firstName} ${doctor.lastName}`,
          email: doctor.email,
          totalAppointments: appointments.length,
          completedAppointments,
          cancelledAppointments,
          completionRate: Math.round(completionRate * 100) / 100,
          totalRevenue,
          averageRevenuePerAppointment: completedAppointments > 0 ? totalRevenue / completedAppointments : 0,
          patients: [...new Set(appointments.map(apt => apt.userId.toString()))].length
        };
      })
    );

    return {
      summary: {
        totalDoctors: doctors.length,
        period: { startDate, endDate }
      },
      doctorPerformance: doctorPerformance.sort((a, b) => b.totalAppointments - a.totalAppointments)
    };
  }

  // Generate medical trends report
  async generateMedicalTrendsReport(startDate, endDate, filters) {
    const query = { 'medicalHistory.date': { $gte: startDate, $lte: endDate } };
    
    if (filters.doctorId) {
      query['medicalHistory.doctor'] = filters.doctorId;
    }

    // Common diagnoses
    const commonDiagnoses = await PatientModel.aggregate([
      { $unwind: '$medicalHistory' },
      { $match: { ...query, 'medicalHistory.diagnosis': { $exists: true, $ne: null } } },
      { $group: { _id: '$medicalHistory.diagnosis', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    // Common symptoms
    const commonSymptoms = await PatientModel.aggregate([
      { $unwind: '$medicalHistory' },
      { $unwind: '$medicalHistory.symptoms' },
      { $match: query },
      { $group: { _id: '$medicalHistory.symptoms', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    // Medication prescriptions
    const medicationPrescriptions = await PatientModel.aggregate([
      { $unwind: '$medicalHistory' },
      { $unwind: '$medicalHistory.medications' },
      { $match: query },
      { $group: { _id: '$medicalHistory.medications.name', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    // Lab test frequency
    const labTestFrequency = await PatientModel.aggregate([
      { $unwind: '$medicalHistory' },
      { $unwind: '$medicalHistory.labResults' },
      { $match: query },
      { $group: { _id: '$medicalHistory.labResults.testName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    return {
      summary: {
        period: { startDate, endDate }
      },
      commonDiagnoses,
      commonSymptoms,
      medicationPrescriptions,
      labTestFrequency
    };
  }

  // Generate system usage report
  async generateSystemUsageReport(startDate, endDate, filters) {
    const totalUsers = await UserModel.countDocuments();
    const activeUsers = await UserModel.countDocuments({
      createdAt: { $lte: endDate }
    });

    const userRegistrationTrend = await UserModel.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const roleDistribution = await UserModel.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    return {
      summary: {
        totalUsers,
        activeUsers,
        period: { startDate, endDate }
      },
      userRegistrationTrend,
      roleDistribution
    };
  }

  // Generate custom report
  async generateCustomReport(startDate, endDate, filters) {
    // This can be extended based on specific requirements
    return {
      summary: {
        period: { startDate, endDate },
        filters,
        message: 'Custom report generated successfully'
      },
      data: {
        patients: await PatientModel.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
        appointments: await AppointmentModel.countDocuments({ date: { $gte: startDate, $lte: endDate } }),
        revenue: await BillModel.aggregate([
          { $match: { date: { $gte: startDate, $lte: endDate }, status: 'paid' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ])
      }
    };
  }

  // Get report by ID
  async getReportById(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;

      const report = await ReportModel.findById(id).populate('createdBy', 'firstName lastName email');

      if (!report) {
        return ResponseHandler.sendError(res, 'Report not found', 404);
      }

      // Check access permissions
      if (!report.canAccess(user)) {
        return ResponseHandler.sendError(res, 'Access denied', 403);
      }

      // Update view statistics
      report.statistics.views += 1;
      report.statistics.lastViewed = new Date();
      await report.save();

      return ResponseHandler.sendSuccess(res, report, 'Report retrieved successfully');
    } catch (error) {
      console.error('Error getting report:', error);
      return ResponseHandler.sendError(res, 'Failed to get report', 500);
    }
  }

  // Get all reports with pagination and filtering
  async getAllReports(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        reportType,
        status,
        category,
        tags,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const skip = (page - 1) * limit;
      const user = req.user;

      // Build filter query
      const filter = {};
      
      // Access control - only show reports user can access
      if (user.role !== 'Admin') {
        filter.$or = [
          { accessLevel: 'public' },
          { allowedRoles: user.role },
          { allowedUsers: user._id }
        ];
      }

      if (reportType) filter.reportType = reportType;
      if (status) filter.status = status;
      if (category) filter.category = category;
      if (tags) filter.tags = { $in: tags.split(',') };
      if (search) {
        filter.$text = { $search: search };
      }

      // Build sort query
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const reports = await ReportModel.find(filter)
        .populate('createdBy', 'firstName lastName email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

      const total = await ReportModel.countDocuments(filter);

      return ResponseHandler.sendSuccess(res, {
        reports,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }, 'Reports retrieved successfully');
    } catch (error) {
      console.error('Error getting reports:', error);
      return ResponseHandler.sendError(res, 'Failed to get reports', 500);
    }
  }

  // Update report
  async updateReport(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      const updateData = req.body;

      const report = await ReportModel.findById(id);

      if (!report) {
        return ResponseHandler.sendError(res, 'Report not found', 404);
      }

      // Check if user can modify this report
      if (report.createdBy.toString() !== userId.toString() && req.user.role !== 'Admin') {
        return ResponseHandler.sendError(res, 'Access denied', 403);
      }

      // Update report
      Object.assign(report, updateData);
      report.lastModifiedBy = userId;
      report.version += 1;

      await report.save();

      return ResponseHandler.sendSuccess(res, report, 'Report updated successfully');
    } catch (error) {
      console.error('Error updating report:', error);
      return ResponseHandler.sendError(res, 'Failed to update report', 500);
    }
  }

  // Delete report
  async deleteReport(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;

      const report = await ReportModel.findById(id);

      if (!report) {
        return ResponseHandler.sendError(res, 'Report not found', 404);
      }

      // Check if user can delete this report
      if (report.createdBy.toString() !== userId.toString() && req.user.role !== 'Admin') {
        return ResponseHandler.sendError(res, 'Access denied', 403);
      }

      // Delete associated files if any
      if (report.exportPath && fs.existsSync(report.exportPath)) {
        fs.unlinkSync(report.exportPath);
      }

      await ReportModel.findByIdAndDelete(id);

      return ResponseHandler.sendSuccess(res, null, 'Report deleted successfully');
    } catch (error) {
      console.error('Error deleting report:', error);
      return ResponseHandler.sendError(res, 'Failed to delete report', 500);
    }
  }

  // Export report
  async exportReport(req, res) {
    try {
      const { id } = req.params;
      const { format = 'json' } = req.query;
      const user = req.user;

      const report = await ReportModel.findById(id);

      if (!report) {
        return ResponseHandler.sendError(res, 'Report not found', 404);
      }

      // Check access permissions
      if (!report.canAccess(user)) {
        return ResponseHandler.sendError(res, 'Access denied', 403);
      }

      // Update download statistics
      report.statistics.downloads += 1;
      report.statistics.lastDownloaded = new Date();
      await report.save();

      // Set appropriate headers based on format
      const filename = `${report.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}`;

      switch (format) {
        case 'json':
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
          return res.json(report.content);

        case 'csv':
          // Convert to CSV format (simplified implementation)
          const csvData = this.convertToCSV(report.content);
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
          return res.send(csvData);

        default:
          return ResponseHandler.sendError(res, 'Unsupported export format', 400);
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      return ResponseHandler.sendError(res, 'Failed to export report', 500);
    }
  }

  // Convert data to CSV format
  convertToCSV(data) {
    if (!data || typeof data !== 'object') return '';

    // Simple CSV conversion for basic data structures
    if (Array.isArray(data)) {
      if (data.length === 0) return '';
      
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(row => Object.values(row).join(','));
      return [headers, ...rows].join('\n');
    }

    // For object data, convert to key-value pairs
    return Object.entries(data)
      .map(([key, value]) => `${key},${value}`)
      .join('\n');
  }

  // Get report templates
  async getReportTemplates(req, res) {
    try {
      const templates = await ReportModel.find({ isTemplate: true })
        .populate('createdBy', 'firstName lastName email')
        .sort({ createdAt: -1 });

      return ResponseHandler.sendSuccess(res, templates, 'Report templates retrieved successfully');
    } catch (error) {
      console.error('Error getting report templates:', error);
      return ResponseHandler.sendError(res, 'Failed to get report templates', 500);
    }
  }

  // Create report template
  async createReportTemplate(req, res) {
    try {
      const templateData = {
        ...req.body,
        isTemplate: true,
        createdBy: req.user._id
      };

      const template = new ReportModel(templateData);
      await template.save();

      return ResponseHandler.sendSuccess(res, template, 'Report template created successfully');
    } catch (error) {
      console.error('Error creating report template:', error);
      return ResponseHandler.sendError(res, 'Failed to create report template', 500);
    }
  }
}

export default new ReportsController();
