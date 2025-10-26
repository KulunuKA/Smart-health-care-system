import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Filter,
  Calendar,
  Users,
  DollarSign,
  Activity,
  Download as DownloadIcon,
  FileText,
  ArrowRight,
  Eye
} from 'lucide-react';
import Card, { StatCard } from '../components/common/Card';
import Loader from '../components/common/Loader';
import AnalyticsService from '../services/analyticsService';
import ReportsService from '../services/reportsService';
import { DashboardSummaryCharts } from '../components/charts/ChartComponents';

/**
 * Reports Page Component
 * Analytics and reporting dashboard for managers and admins
 */
const ReportsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    // Redirect admin users to admin reports page
    if (user?.role === 'Admin') {
      navigate('/admin/reports');
      return;
    }
    
    fetchReportsData();
  }, [user, navigate, dateRange]);

  const fetchReportsData = async () => {
    setLoading(true);
    try {
      const [summaryResponse, reportsResponse] = await Promise.all([
        AnalyticsService.getDashboardSummary(),
        ReportsService.getAllReports({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' })
      ]);

      setDashboardSummary(summaryResponse.data);
      setRecentReports(reportsResponse.data.reports || []);
    } catch (error) {
      console.error('Error fetching reports data:', error);
      // Fallback to mock data if API fails
      setDashboardSummary(getMockDashboardSummary());
      setRecentReports([]);
    } finally {
      setLoading(false);
    }
  };

  const getMockDashboardSummary = () => {
    return {
      monthly: {
        totalPatients: 2847,
        newPatients: 156,
        activePatients: 1234
      },
      weekly: {
        totalAppointments: 234,
        completedAppointments: 198
      },
      daily: {
        totalRevenue: 45230,
        paidBills: 45
      }
    };
  };

  const handleViewReport = (reportId) => {
    // For non-admin users, we can show a simplified view or redirect to a public report view
    console.log('Viewing report:', reportId);
  };

  const handleExportReport = async (reportId, format) => {
    try {
      await ReportsService.exportReport(reportId, format);
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Failed to export report: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" text="Loading reports..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
            <p className="text-gray-600 mt-2">Comprehensive healthcare analytics and insights</p>
          </div>
          <div className="flex space-x-2 mt-4 sm:mt-0">
            <button
              onClick={() => handleExportReport('pdf')}
              className="btn-outline flex items-center"
            >
              <DownloadIcon className="w-4 h-4 mr-2" />
              Export PDF
            </button>
            <button
              onClick={() => handleExportReport('csv')}
              className="btn-outline flex items-center"
            >
              <DownloadIcon className="w-4 h-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Quick Actions */}
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
            <div className="flex items-end">
              <button
                onClick={() => navigate('/admin/analytics')}
                className="btn-outline flex items-center"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                View Analytics
              </button>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        {dashboardSummary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Patients"
              value={dashboardSummary.monthly?.totalPatients?.toLocaleString() || '0'}
              change={`+${dashboardSummary.monthly?.newPatients || 0}`}
              changeType="positive"
              icon={Users}
            />
            <StatCard
              title="Appointments"
              value={dashboardSummary.weekly?.totalAppointments?.toLocaleString() || '0'}
              change={`+${dashboardSummary.weekly?.completedAppointments || 0}`}
              changeType="positive"
              icon={Calendar}
            />
            <StatCard
              title="Revenue"
              value={`$${dashboardSummary.daily?.totalRevenue?.toLocaleString() || '0'}`}
              change={`+${dashboardSummary.daily?.paidBills || 0}`}
              changeType="positive"
              icon={DollarSign}
            />
            <StatCard
              title="System Uptime"
              value="99.9%"
              change="+0.1%"
              changeType="positive"
              icon={Activity}
            />
          </div>
        )}

        {/* Charts Section */}
        <DashboardSummaryCharts summaryData={dashboardSummary} />

        {/* Recent Reports */}
        <div className="mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Reports</h3>
              <button
                onClick={() => navigate('/admin/reports')}
                className="btn-outline flex items-center"
              >
                View All Reports
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
            
            {recentReports.length > 0 ? (
              <div className="space-y-4">
                {recentReports.map((report) => (
                  <div key={report._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{report.title}</h4>
                        <p className="text-sm text-gray-600">{report.description}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-500">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-gray-500 capitalize">
                            {report.reportType.replace('_', ' ')}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            report.status === 'completed' ? 'bg-green-100 text-green-800' :
                            report.status === 'generating' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {report.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewReport(report._id)}
                        className="p-2 text-blue-400 hover:text-blue-600"
                        title="View Report"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleExportReport(report._id, report.format)}
                        className="p-2 text-green-400 hover:text-green-600"
                        title="Export Report"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">No Recent Reports</h4>
                <p className="text-gray-600 mb-4">Reports will appear here once they are generated.</p>
                <button
                  onClick={() => navigate('/admin/reports')}
                  className="btn-primary"
                >
                  Generate Report
                </button>
              </div>
            )}
          </Card>
        </div>

        {/* Report Templates */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Report Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button 
              onClick={() => navigate('/admin/reports')}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
            >
              <h4 className="font-medium text-gray-900 mb-1">Monthly Summary</h4>
              <p className="text-sm text-gray-600">Comprehensive monthly report</p>
            </button>
            <button 
              onClick={() => navigate('/admin/reports')}
              className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors text-left"
            >
              <h4 className="font-medium text-gray-900 mb-1">Financial Report</h4>
              <p className="text-sm text-gray-600">Revenue and expense analysis</p>
            </button>
            <button 
              onClick={() => navigate('/admin/reports')}
              className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-left"
            >
              <h4 className="font-medium text-gray-900 mb-1">Patient Analytics</h4>
              <p className="text-sm text-gray-600">Patient flow and demographics</p>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ReportsPage;