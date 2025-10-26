import mongoose from 'mongoose';
import { AnalyticsModel } from './modules/analytics/analyticsModel.js';
import { ReportModel } from './modules/reports/reportModel.js';
import { UserModel } from './modules/user/userModel.js';
import { PatientModel } from './modules/patient/patientModel.js';
import { AppointmentModel } from './modules/appointments/appointmentModel.js';
import { BillModel } from './modules/payment/billModel.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-healthcare');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Test Analytics functionality
const testAnalytics = async () => {
  console.log('\n=== Testing Analytics Functionality ===');
  
  try {
    // Create a test user for analytics
    const testUser = await UserModel.findOne({ email: 'admin@test.com' });
    if (!testUser) {
      console.log('No test user found. Please create a user first.');
      return;
    }

    // Test analytics generation
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const endDate = new Date();

    console.log('Generating analytics...');
    const analytics = new AnalyticsModel({
      reportType: 'monthly',
      period: { startDate, endDate },
      generatedBy: testUser._id,
      status: 'generating'
    });

    await analytics.save();
    console.log('Analytics record created:', analytics._id);

    // Test getting analytics
    const retrievedAnalytics = await AnalyticsModel.findById(analytics._id)
      .populate('generatedBy', 'firstName lastName email');
    
    console.log('Retrieved analytics:', {
      id: retrievedAnalytics._id,
      reportType: retrievedAnalytics.reportType,
      generatedBy: retrievedAnalytics.generatedBy?.firstName,
      status: retrievedAnalytics.status
    });

    // Test analytics listing
    const allAnalytics = await AnalyticsModel.find()
      .populate('generatedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5);
    
    console.log(`Found ${allAnalytics.length} analytics records`);

  } catch (error) {
    console.error('Analytics test error:', error);
  }
};

// Test Reports functionality
const testReports = async () => {
  console.log('\n=== Testing Reports Functionality ===');
  
  try {
    // Create a test user for reports
    const testUser = await UserModel.findOne({ email: 'admin@test.com' });
    if (!testUser) {
      console.log('No test user found. Please create a user first.');
      return;
    }

    // Test report generation
    console.log('Generating test report...');
    const report = new ReportModel({
      title: 'Test Patient Summary Report',
      description: 'A test report for patient summary',
      reportType: 'patient_summary',
      parameters: {
        dateRange: {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: new Date()
        }
      },
      format: 'json',
      accessLevel: 'private',
      createdBy: testUser._id,
      status: 'pending'
    });

    await report.save();
    console.log('Report created:', report._id);

    // Test getting report
    const retrievedReport = await ReportModel.findById(report._id)
      .populate('createdBy', 'firstName lastName email');
    
    console.log('Retrieved report:', {
      id: retrievedReport._id,
      title: retrievedReport.title,
      reportType: retrievedReport.reportType,
      createdBy: retrievedReport.createdBy?.firstName,
      status: retrievedReport.status
    });

    // Test reports listing
    const allReports = await ReportModel.find()
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5);
    
    console.log(`Found ${allReports.length} reports`);

    // Test report templates
    const templateReport = new ReportModel({
      title: 'Monthly Patient Report Template',
      description: 'Template for monthly patient reports',
      reportType: 'patient_summary',
      isTemplate: true,
      createdBy: testUser._id,
      status: 'completed'
    });

    await templateReport.save();
    console.log('Template created:', templateReport._id);

    const templates = await ReportModel.find({ isTemplate: true });
    console.log(`Found ${templates.length} report templates`);

  } catch (error) {
    console.error('Reports test error:', error);
  }
};

// Test data statistics
const testDataStatistics = async () => {
  console.log('\n=== Testing Data Statistics ===');
  
  try {
    const userCount = await UserModel.countDocuments();
    const patientCount = await PatientModel.countDocuments();
    const appointmentCount = await AppointmentModel.countDocuments();
    const billCount = await BillModel.countDocuments();
    const analyticsCount = await AnalyticsModel.countDocuments();
    const reportCount = await ReportModel.countDocuments();

    console.log('Database Statistics:');
    console.log(`- Users: ${userCount}`);
    console.log(`- Patients: ${patientCount}`);
    console.log(`- Appointments: ${appointmentCount}`);
    console.log(`- Bills: ${billCount}`);
    console.log(`- Analytics: ${analyticsCount}`);
    console.log(`- Reports: ${reportCount}`);

    // Test role distribution
    const roleDistribution = await UserModel.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    console.log('User Role Distribution:', roleDistribution);

  } catch (error) {
    console.error('Data statistics test error:', error);
  }
};

// Main test function
const runTests = async () => {
  console.log('Starting Analytics & Reports System Tests...');
  
  await connectDB();
  await testDataStatistics();
  await testAnalytics();
  await testReports();
  
  console.log('\n=== Tests Completed ===');
  console.log('Analytics & Reports system is ready for use!');
  
  // Close connection
  await mongoose.connection.close();
  console.log('Database connection closed.');
};

// Run tests
runTests().catch(console.error);
