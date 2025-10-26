import { AnalyticsModel } from './analyticsModel.js';
import { PatientModel } from '../patient/patientModel.js';
import { AppointmentModel } from '../appointments/appointmentModel.js';
import { BillModel } from '../payment/billModel.js';
import { UserModel } from '../user/userModel.js';
import { ResponseHandler } from '../../utils/ResponseHandler.js';

class AnalyticsController {
  // Generate comprehensive analytics for a given period
  generateAnalytics = async (req, res) => {
    try {
      const { startDate, endDate, reportType = 'custom' } = req.body;
      
      // Handle authentication - use a default user ID if not authenticated
      const userId = req.user?._id || '000000000000000000000000'; // Default ObjectId

      if (!startDate || !endDate) {
        return ResponseHandler.sendError(res, 'Start date and end date are required', 400);
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      // Create analytics record
      const analytics = new AnalyticsModel({
        reportType,
        period: { startDate: start, endDate: end },
        generatedBy: userId,
        status: 'generating'
      });

      await analytics.save();

      // Calculate all metrics sequentially to avoid binding issues
      const patientMetrics = await this.calculatePatientMetrics(start, end);
      const appointmentMetrics = await this.calculateAppointmentMetrics(start, end);
      const doctorMetrics = await this.calculateDoctorMetrics(start, end);
      const financialMetrics = await this.calculateFinancialMetrics(start, end);
      const medicalMetrics = await this.calculateMedicalMetrics(start, end);
      const geographicMetrics = await this.calculateGeographicMetrics(start, end);

      // Update analytics with calculated metrics
      analytics.patientMetrics = patientMetrics;
      analytics.appointmentMetrics = appointmentMetrics;
      analytics.doctorMetrics = doctorMetrics;
      analytics.financialMetrics = financialMetrics;
      analytics.medicalMetrics = medicalMetrics;
      analytics.geographicMetrics = geographicMetrics;
      analytics.status = 'completed';

      await analytics.save();

      return ResponseHandler.sendSuccess(res, analytics, 'Analytics generated successfully');
    } catch (error) {
      console.error('Error generating analytics:', error);
      return ResponseHandler.sendError(res, 'Failed to generate analytics: ' + error.message, 500);
    }
  }

  // Calculate patient metrics
  calculatePatientMetrics = async (startDate, endDate) => {
    try {
      const totalPatients = await PatientModel.countDocuments();
      const newPatients = await PatientModel.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate }
      });
      const activePatients = await PatientModel.countDocuments({
        status: 'active',
        lastVisit: { $gte: startDate, $lte: endDate }
      });

      // Calculate patient retention rate
      const patientsWithMultipleVisits = await PatientModel.countDocuments({
        'medicalHistory.1': { $exists: true },
        lastVisit: { $gte: startDate, $lte: endDate }
      });
      const patientRetentionRate = activePatients > 0 ? (patientsWithMultipleVisits / activePatients) * 100 : 0;

      // Calculate average age
      const patients = await PatientModel.find({}, 'dateOfBirth').lean();
      const totalAge = patients.reduce((sum, patient) => {
        if (patient.dateOfBirth) {
          const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
          return sum + age;
        }
        return sum;
      }, 0);
      const averageAge = patients.length > 0 ? totalAge / patients.length : 0;

      // Gender distribution
      const genderDistribution = await PatientModel.aggregate([
        { $group: { _id: '$gender', count: { $sum: 1 } } }
      ]);

      const genderDist = {
        male: 0,
        female: 0,
        other: 0
      };
      genderDistribution.forEach(item => {
        genderDist[item._id] = item.count;
      });

      // Age group distribution
      const ageGroupDistribution = {
        '0-18': 0,
        '19-35': 0,
        '36-50': 0,
        '51-65': 0,
        '65+': 0
      };

      patients.forEach(patient => {
        if (patient.dateOfBirth) {
          const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
          if (age <= 18) ageGroupDistribution['0-18']++;
          else if (age <= 35) ageGroupDistribution['19-35']++;
          else if (age <= 50) ageGroupDistribution['36-50']++;
          else if (age <= 65) ageGroupDistribution['51-65']++;
          else ageGroupDistribution['65+']++;
        }
      });

      return {
        totalPatients,
        newPatients,
        activePatients,
        patientRetentionRate: Math.round(patientRetentionRate * 100) / 100,
        averageAge: Math.round(averageAge * 100) / 100,
        genderDistribution: genderDist,
        ageGroupDistribution
      };
    } catch (error) {
      console.error('Error calculating patient metrics:', error);
      throw error;
    }
  }

  // Calculate appointment metrics
  calculateAppointmentMetrics = async (startDate, endDate) => {
    try {
      const appointments = await AppointmentModel.find({
        date: { $gte: startDate, $lte: endDate }
      });

      const totalAppointments = appointments.length;
      const scheduledAppointments = appointments.filter(apt => apt.status === 'scheduled').length;
      const confirmedAppointments = appointments.filter(apt => apt.status === 'confirmed').length;
      const completedAppointments = appointments.filter(apt => apt.status === 'completed').length;
      const cancelledAppointments = appointments.filter(apt => apt.status === 'cancelled').length;

      const noShowRate = totalAppointments > 0 ? (cancelledAppointments / totalAppointments) * 100 : 0;

      // Peak hours analysis
      const peakHours = await AppointmentModel.aggregate([
        { $match: { date: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: { $hour: '$date' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);

      // Appointment reasons analysis
      const appointmentReasons = await AppointmentModel.aggregate([
        { $match: { date: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: '$reason', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      return {
        totalAppointments,
        scheduledAppointments,
        confirmedAppointments,
        completedAppointments,
        cancelledAppointments,
        noShowRate: Math.round(noShowRate * 100) / 100,
        averageAppointmentDuration: 30, // Default 30 minutes
        peakHours: peakHours.map(item => ({ hour: item._id, count: item.count })),
        appointmentReasons: appointmentReasons.map(item => ({ reason: item._id, count: item.count }))
      };
    } catch (error) {
      console.error('Error calculating appointment metrics:', error);
      throw error;
    }
  }

  // Calculate doctor metrics
  calculateDoctorMetrics = async (startDate, endDate) => {
    try {
      const totalDoctors = await UserModel.countDocuments({ role: 'Doctor' });
      const activeDoctors = await UserModel.countDocuments({
        role: 'Doctor',
        createdAt: { $lte: endDate }
      });

      // Doctor utilization
      const doctorUtilization = await AppointmentModel.aggregate([
        { $match: { date: { $gte: startDate, $lte: endDate } } },
        {
          $lookup: {
            from: 'users',
            localField: 'doctorId',
            foreignField: '_id',
            as: 'doctor'
          }
        },
        { $unwind: '$doctor' },
        {
          $group: {
            _id: '$doctorId',
            doctorName: { $first: { $concat: ['$doctor.firstName', ' ', '$doctor.lastName'] } },
            appointmentCount: { $sum: 1 }
          }
        },
        { $sort: { appointmentCount: -1 } }
      ]);

      const averagePatientsPerDoctor = activeDoctors > 0 ? 
        doctorUtilization.reduce((sum, doc) => sum + doc.appointmentCount, 0) / activeDoctors : 0;

      // Calculate utilization rate for each doctor
      const maxPossibleAppointments = 8 * Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)); // 8 appointments per day
      const doctorUtilizationWithRate = doctorUtilization.map(doc => ({
        doctorId: doc._id,
        doctorName: doc.doctorName,
        appointmentCount: doc.appointmentCount,
        utilizationRate: Math.round((doc.appointmentCount / maxPossibleAppointments) * 100 * 100) / 100
      }));

      return {
        totalDoctors,
        activeDoctors,
        averagePatientsPerDoctor: Math.round(averagePatientsPerDoctor * 100) / 100,
        doctorUtilization: doctorUtilizationWithRate
      };
    } catch (error) {
      console.error('Error calculating doctor metrics:', error);
      throw error;
    }
  }

  // Calculate financial metrics
  calculateFinancialMetrics = async (startDate, endDate) => {
    try {
      const bills = await BillModel.find({
        date: { $gte: startDate, $lte: endDate }
      });

      const totalRevenue = bills.reduce((sum, bill) => sum + bill.amount, 0);
      const paidBills = bills.filter(bill => bill.status === 'paid').length;
      const unpaidBills = bills.filter(bill => bill.status === 'unpaid').length;
      const overdueBills = bills.filter(bill => bill.status === 'overdue').length;

      const averageBillAmount = bills.length > 0 ? totalRevenue / bills.length : 0;

      // Payment method distribution
      const paymentMethodDistribution = await BillModel.aggregate([
        { $match: { date: { $gte: startDate, $lte: endDate }, status: 'paid' } },
        { $group: { _id: '$paymentMethod', count: { $sum: 1 } } }
      ]);

      const paymentDist = { card: 0, bank: 0, wallet: 0 };
      paymentMethodDistribution.forEach(item => {
        if (item._id) paymentDist[item._id] = item.count;
      });

      // Revenue by month
      const revenueByMonth = await BillModel.aggregate([
        { $match: { date: { $gte: startDate, $lte: endDate }, status: 'paid' } },
        {
          $group: {
            _id: {
              month: { $month: '$date' },
              year: { $year: '$date' }
            },
            amount: { $sum: '$amount' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]);

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      const revenueByMonthFormatted = revenueByMonth.map(item => ({
        month: monthNames[item._id.month - 1],
        year: item._id.year,
        amount: item.amount
      }));

      return {
        totalRevenue,
        paidBills,
        unpaidBills,
        overdueBills,
        averageBillAmount: Math.round(averageBillAmount * 100) / 100,
        paymentMethodDistribution: paymentDist,
        revenueByMonth: revenueByMonthFormatted
      };
    } catch (error) {
      console.error('Error calculating financial metrics:', error);
      throw error;
    }
  }

  // Calculate medical metrics
  calculateMedicalMetrics = async (startDate, endDate) => {
    try {
      // Common diagnoses
      const commonDiagnoses = await PatientModel.aggregate([
        { $unwind: '$medicalHistory' },
        { $match: { 'medicalHistory.date': { $gte: startDate, $lte: endDate } } },
        { $group: { _id: '$medicalHistory.diagnosis', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      // Common symptoms
      const commonSymptoms = await PatientModel.aggregate([
        { $unwind: '$medicalHistory' },
        { $unwind: '$medicalHistory.symptoms' },
        { $match: { 'medicalHistory.date': { $gte: startDate, $lte: endDate } } },
        { $group: { _id: '$medicalHistory.symptoms', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      // Medication prescriptions
      const medicationPrescriptions = await PatientModel.aggregate([
        { $unwind: '$medicalHistory' },
        { $unwind: '$medicalHistory.medications' },
        { $match: { 'medicalHistory.date': { $gte: startDate, $lte: endDate } } },
        { $group: { _id: '$medicalHistory.medications.name', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      // Lab test frequency
      const labTestFrequency = await PatientModel.aggregate([
        { $unwind: '$medicalHistory' },
        { $unwind: '$medicalHistory.labResults' },
        { $match: { 'medicalHistory.date': { $gte: startDate, $lte: endDate } } },
        { $group: { _id: '$medicalHistory.labResults.testName', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      // Follow-up required
      const followUpRequired = await PatientModel.countDocuments({
        'medicalHistory.followUpRequired': true,
        'medicalHistory.date': { $gte: startDate, $lte: endDate }
      });

      return {
        commonDiagnoses: commonDiagnoses.map(item => ({ diagnosis: item._id, count: item.count })),
        commonSymptoms: commonSymptoms.map(item => ({ symptom: item._id, count: item.count })),
        medicationPrescriptions: medicationPrescriptions.map(item => ({ medication: item._id, count: item.count })),
        labTestFrequency: labTestFrequency.map(item => ({ testName: item._id, count: item.count })),
        followUpRequired
      };
    } catch (error) {
      console.error('Error calculating medical metrics:', error);
      throw error;
    }
  }

  // Calculate geographic metrics
  calculateGeographicMetrics = async (startDate, endDate) => {
    try {
      // Patient distribution by city
      const patientDistributionByCity = await PatientModel.aggregate([
        { $group: { _id: '$address.city', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      // Patient distribution by state
      const patientDistributionByState = await PatientModel.aggregate([
        { $group: { _id: '$address.state', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      return {
        patientDistributionByCity: patientDistributionByCity.map(item => ({ city: item._id, count: item.count })),
        patientDistributionByState: patientDistributionByState.map(item => ({ state: item._id, count: item.count }))
      };
    } catch (error) {
      console.error('Error calculating geographic metrics:', error);
      throw error;
    }
  }

  // Get analytics by ID
  getAnalyticsById = async (req, res) => {
    try {
      const { id } = req.params;
      const analytics = await AnalyticsModel.findById(id).populate('generatedBy', 'firstName lastName email');

      if (!analytics) {
        return ResponseHandler.sendError(res, 'Analytics not found', 404);
      }

      return ResponseHandler.sendSuccess(res, analytics, 'Analytics retrieved successfully');
    } catch (error) {
      console.error('Error getting analytics:', error);
      return ResponseHandler.sendError(res, 'Failed to get analytics', 500);
    }
  }

  // Get all analytics with pagination
  getAllAnalytics = async (req, res) => {
    try {
      const { page = 1, limit = 10, reportType, status } = req.query;
      const skip = (page - 1) * limit;

      const filter = {};
      if (reportType) filter.reportType = reportType;
      if (status) filter.status = status;

      const analytics = await AnalyticsModel.find(filter)
        .populate('generatedBy', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await AnalyticsModel.countDocuments(filter);

      return ResponseHandler.sendSuccess(res, {
        analytics,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }, 'Analytics retrieved successfully');
    } catch (error) {
      console.error('Error getting analytics:', error);
      return ResponseHandler.sendError(res, 'Failed to get analytics', 500);
    }
  }

  // Get dashboard summary
  getDashboardSummary = async (req, res) => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));

      const [
        monthlyMetrics,
        weeklyMetrics,
        dailyMetrics
      ] = await Promise.all([
        this.calculatePatientMetrics(startOfMonth, now),
        this.calculateAppointmentMetrics(startOfWeek, now),
        this.calculateFinancialMetrics(startOfDay, now)
      ]);

      const summary = {
        monthly: monthlyMetrics,
        weekly: weeklyMetrics,
        daily: dailyMetrics,
        generatedAt: new Date()
      };

      return ResponseHandler.sendSuccess(res, summary, 'Dashboard summary retrieved successfully');
    } catch (error) {
      console.error('Error getting dashboard summary:', error);
      return ResponseHandler.sendError(res, 'Failed to get dashboard summary', 500);
    }
  }

  // Delete analytics
  deleteAnalytics = async (req, res) => {
    try {
      const { id } = req.params;
      const analytics = await AnalyticsModel.findByIdAndDelete(id);

      if (!analytics) {
        return ResponseHandler.sendError(res, 'Analytics not found', 404);
      }

      return ResponseHandler.sendSuccess(res, null, 'Analytics deleted successfully');
    } catch (error) {
      console.error('Error deleting analytics:', error);
      return ResponseHandler.sendError(res, 'Failed to delete analytics', 500);
    }
  }
}

export default new AnalyticsController();
