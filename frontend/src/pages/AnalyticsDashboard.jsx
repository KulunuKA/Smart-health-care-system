import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar,
  DollarSign,
  Activity,
  RefreshCw,
  Download,
  Filter,
  Eye,
  Trash2,
  Clock,
  CheckCircle,
  AlertTriangle,
  Heart,
  Stethoscope,
  MapPin,
  PieChart
} from 'lucide-react';
import Card, { StatCard } from '../components/common/Card';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import AnalyticsService from '../services/analyticsService';
import {
  PatientDemographicsChart,
  AgeGroupChart,
  AppointmentStatusChart,
  RevenueTrendChart,
  DoctorPerformanceChart,
  PaymentMethodChart,
  PeakHoursChart,
  CommonDiagnosesChart,
  GeographicChart,
  DashboardSummaryCharts
} from '../components/charts/ChartComponents';

/**
 * Analytics Dashboard Page Component
 * Comprehensive analytics dashboard with real-time data and insights
 */
const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [dateRange, setDateRange] = useState('30');
  const [reportType, setReportType] = useState('monthly');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [summaryResponse, analyticsResponse] = await Promise.all([
        AnalyticsService.getDashboardSummary(),
        AnalyticsService.getAllAnalytics({ 
          reportType: reportType,
          limit: 1,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        })
      ]);

      setDashboardSummary(summaryResponse.data);
      
      if (analyticsResponse.data?.analytics?.length > 0) {
        setAnalytics(analyticsResponse.data.analytics[0]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const generateNewAnalytics = async () => {
    setGenerating(true);
    try {
      const dateRangeFormatted = AnalyticsService.formatDateRange(dateRange);
      const response = await AnalyticsService.generateAnalytics({
        startDate: dateRangeFormatted.startDate,
        endDate: dateRangeFormatted.endDate,
        reportType: reportType
      });

      setAnalytics(response.data);
      setShowGenerateModal(false);
    } catch (error) {
      console.error('Error generating analytics:', error);
      alert('Failed to generate analytics: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const deleteAnalytics = async (id) => {
    if (window.confirm('Are you sure you want to delete this analytics record?')) {
      try {
        await AnalyticsService.deleteAnalytics(id);
        await fetchDashboardData();
      } catch (error) {
        console.error('Error deleting analytics:', error);
        alert('Failed to delete analytics: ' + error.message);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'generating': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'generating': return <Clock className="w-4 h-4" />;
      case 'failed': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" text="Loading analytics dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">Real-time healthcare analytics and insights</p>
          </div>
          <div className="flex space-x-2 mt-4 sm:mt-0">
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="btn-outline flex items-center"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="btn-primary flex items-center"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Generate Analytics
            </button>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="sm:w-48">
              <label className="label">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="input-field"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
            </div>
            <div className="sm:w-48">
              <label className="label">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="input-field"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Dashboard Summary Stats */}
        {dashboardSummary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Monthly Patients"
              value={dashboardSummary.monthly?.totalPatients || 0}
              change={`+${dashboardSummary.monthly?.newPatients || 0}`}
              changeType="positive"
              icon={Users}
            />
            <StatCard
              title="Weekly Appointments"
              value={dashboardSummary.weekly?.totalAppointments || 0}
              change={`+${dashboardSummary.weekly?.completedAppointments || 0}`}
              changeType="positive"
              icon={Calendar}
            />
            <StatCard
              title="Daily Revenue"
              value={`$${dashboardSummary.daily?.totalRevenue || 0}`}
              change={`+${dashboardSummary.daily?.paidBills || 0}`}
              changeType="positive"
              icon={DollarSign}
            />
            <StatCard
              title="System Health"
              value="99.9%"
              change="+0.1%"
              changeType="positive"
              icon={Activity}
            />
          </div>
        )}

        {/* Analytics Content */}
        {analytics ? (
          <div className="space-y-8">
            {/* Analytics Header */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {analytics.reportType.charAt(0).toUpperCase() + analytics.reportType.slice(1)} Analytics
                  </h3>
                  <p className="text-sm text-gray-600">
                    Generated on {new Date(analytics.createdAt).toLocaleDateString()} by {analytics.generatedBy?.firstName} {analytics.generatedBy?.lastName}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(analytics.status)}`}>
                    {getStatusIcon(analytics.status)}
                    <span className="ml-1">{analytics.status}</span>
                  </span>
                  <button
                    onClick={() => deleteAnalytics(analytics._id)}
                    className="p-2 text-red-400 hover:text-red-600"
                    title="Delete Analytics"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>

            {/* Patient Metrics */}
            {analytics.patientMetrics && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-blue-600" />
                    Patient Demographics
                  </h3>
                  <PatientDemographicsChart data={analytics} />
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <PieChart className="w-5 h-5 mr-2 text-purple-600" />
                    Age Group Distribution
                  </h3>
                  <AgeGroupChart data={analytics} />
                </Card>
              </div>
            )}

            {/* Patient Stats Cards */}
            {analytics.patientMetrics && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-600" />
                  Patient Statistics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{analytics.patientMetrics.totalPatients}</div>
                    <div className="text-sm text-gray-600">Total Patients</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{analytics.patientMetrics.newPatients}</div>
                    <div className="text-sm text-gray-600">New Patients</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{analytics.patientMetrics.patientRetentionRate}%</div>
                    <div className="text-sm text-gray-600">Retention Rate</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{analytics.patientMetrics.averageAge}</div>
                    <div className="text-sm text-gray-600">Average Age</div>
                  </div>
                </div>
              </Card>
            )}

            {/* Appointment Metrics */}
            {analytics.appointmentMetrics && (
              <div className="space-y-8">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-green-600" />
                    Appointment Status Distribution
                  </h3>
                  <AppointmentStatusChart data={analytics} />
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-purple-600" />
                    Peak Hours Analysis
                  </h3>
                  <PeakHoursChart data={analytics} />
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-green-600" />
                    Appointment Statistics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{analytics.appointmentMetrics.totalAppointments}</div>
                      <div className="text-sm text-gray-600">Total Appointments</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{analytics.appointmentMetrics.completedAppointments}</div>
                      <div className="text-sm text-gray-600">Completed</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{analytics.appointmentMetrics.scheduledAppointments}</div>
                      <div className="text-sm text-gray-600">Scheduled</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{analytics.appointmentMetrics.cancelledAppointments}</div>
                      <div className="text-sm text-gray-600">Cancelled</div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-700">{analytics.appointmentMetrics.noShowRate}%</div>
                      <div className="text-sm text-gray-600">No-Show Rate</div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Financial Metrics */}
            {analytics.financialMetrics && (
              <div className="space-y-8">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                    Revenue Trend
                  </h3>
                  <RevenueTrendChart data={analytics} />
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-blue-600" />
                    Payment Method Distribution
                  </h3>
                  <PaymentMethodChart data={analytics} />
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                    Financial Statistics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">${analytics.financialMetrics.totalRevenue?.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Total Revenue</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{analytics.financialMetrics.paidBills}</div>
                      <div className="text-sm text-gray-600">Paid Bills</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{analytics.financialMetrics.unpaidBills}</div>
                      <div className="text-sm text-gray-600">Unpaid Bills</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{analytics.financialMetrics.overdueBills}</div>
                      <div className="text-sm text-gray-600">Overdue Bills</div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-700">${analytics.financialMetrics.averageBillAmount}</div>
                      <div className="text-sm text-gray-600">Average Bill Amount</div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Doctor Metrics */}
            {analytics.doctorMetrics && (
              <div className="space-y-8">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <Stethoscope className="w-5 h-5 mr-2 text-purple-600" />
                    Doctor Performance
                  </h3>
                  <DoctorPerformanceChart data={analytics} />
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <Stethoscope className="w-5 h-5 mr-2 text-purple-600" />
                    Doctor Statistics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{analytics.doctorMetrics.totalDoctors}</div>
                      <div className="text-sm text-gray-600">Total Doctors</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{analytics.doctorMetrics.activeDoctors}</div>
                      <div className="text-sm text-gray-600">Active Doctors</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{analytics.doctorMetrics.averagePatientsPerDoctor}</div>
                      <div className="text-sm text-gray-600">Avg Patients/Doctor</div>
                    </div>
                  </div>
                  
                  {analytics.doctorMetrics.doctorUtilization && analytics.doctorMetrics.doctorUtilization.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-md font-semibold text-gray-900 mb-4">Top Performing Doctors</h4>
                      <div className="space-y-3">
                        {analytics.doctorMetrics.doctorUtilization.slice(0, 5).map((doctor, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                                <span className="text-sm font-semibold text-primary-600">{index + 1}</span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{doctor.doctorName}</div>
                                <div className="text-sm text-gray-600">{doctor.appointmentCount} appointments</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-green-600">{doctor.utilizationRate}%</div>
                              <div className="text-xs text-gray-500">utilization</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* Medical Metrics */}
            {analytics.medicalMetrics && (
              <div className="space-y-8">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <Heart className="w-5 h-5 mr-2 text-red-600" />
                    Common Diagnoses
                  </h3>
                  <CommonDiagnosesChart data={analytics} />
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                      <Heart className="w-5 h-5 mr-2 text-red-600" />
                      Common Diagnoses List
                    </h3>
                    <div className="space-y-3">
                      {analytics.medicalMetrics.commonDiagnoses?.slice(0, 5).map((diagnosis, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-sm font-semibold text-red-600">{index + 1}</span>
                            </div>
                            <span className="text-gray-900">{diagnosis.diagnosis}</span>
                          </div>
                          <span className="font-semibold text-gray-900">{diagnosis.count}</span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                      <Activity className="w-5 h-5 mr-2 text-blue-600" />
                      Common Symptoms
                    </h3>
                    <div className="space-y-3">
                      {analytics.medicalMetrics.commonSymptoms?.slice(0, 5).map((symptom, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                            </div>
                            <span className="text-gray-900">{symptom.symptom}</span>
                          </div>
                          <span className="font-semibold text-gray-900">{symptom.count}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Geographic Metrics */}
            {analytics.geographicMetrics && (
              <div className="space-y-8">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-green-600" />
                    Geographic Distribution
                  </h3>
                  <GeographicChart data={analytics} />
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Cities</h3>
                    <div className="space-y-3">
                      {analytics.geographicMetrics.patientDistributionByCity?.slice(0, 5).map((city, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-sm font-semibold text-green-600">{index + 1}</span>
                            </div>
                            <span className="text-gray-900">{city.city}</span>
                          </div>
                          <span className="font-semibold text-gray-900">{city.count}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">States</h3>
                    <div className="space-y-3">
                      {analytics.geographicMetrics.patientDistributionByState?.slice(0, 5).map((state, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                            </div>
                            <span className="text-gray-900">{state.state}</span>
                          </div>
                          <span className="font-semibold text-gray-900">{state.count}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analytics Available</h3>
            <p className="text-gray-600 mb-6">Generate your first analytics report to see insights and metrics.</p>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="btn-primary"
            >
              Generate Analytics
            </button>
          </Card>
        )}

        {/* Generate Analytics Modal */}
        <Modal
          isOpen={showGenerateModal}
          onClose={() => setShowGenerateModal(false)}
          title="Generate New Analytics"
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <label className="label">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="input-field"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="label">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="input-field"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setShowGenerateModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={generateNewAnalytics}
                disabled={generating}
                className="btn-primary"
              >
                {generating ? 'Generating...' : 'Generate Analytics'}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
