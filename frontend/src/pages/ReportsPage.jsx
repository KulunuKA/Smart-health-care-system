import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
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
  FileText
} from 'lucide-react';
import Card, { StatCard } from '../components/common/Card';
import Loader from '../components/common/Loader';

/**
 * Reports Page Component
 * Analytics and reporting dashboard for managers and admins
 */
const ReportsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [dateRange, setDateRange] = useState('30');
  const [reportType, setReportType] = useState('overview');

  useEffect(() => {
    fetchReports();
  }, [dateRange, reportType]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data based on report type
      const mockReports = getMockReportData(reportType, dateRange);
      setReports(mockReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMockReportData = (type, range) => {
    const baseData = {
      overview: {
        stats: [
          { title: 'Total Patients', value: '2,847', change: '+12%', changeType: 'positive', icon: Users },
          { title: 'Appointments', value: '1,234', change: '+8%', changeType: 'positive', icon: Calendar },
          { title: 'Revenue', value: '$45,230', change: '+15%', changeType: 'positive', icon: DollarSign },
          { title: 'System Uptime', value: '99.9%', change: '+0.1%', changeType: 'positive', icon: Activity }
        ],
        charts: [
          {
            title: 'Patient Flow',
            type: 'line',
            data: [
              { month: 'Jan', patients: 120 },
              { month: 'Feb', patients: 135 },
              { month: 'Mar', patients: 150 },
              { month: 'Apr', patients: 145 },
              { month: 'May', patients: 160 },
              { month: 'Jun', patients: 175 }
            ]
          },
          {
            title: 'Revenue by Department',
            type: 'bar',
            data: [
              { department: 'Cardiology', revenue: 15000 },
              { department: 'Pediatrics', revenue: 12000 },
              { department: 'General', revenue: 18000 },
              { department: 'Emergency', revenue: 8000 }
            ]
          }
        ]
      },
      revenue: {
        stats: [
          { title: 'Monthly Revenue', value: '$45,230', change: '+15%', changeType: 'positive', icon: DollarSign },
          { title: 'Average Transaction', value: '$125', change: '+5%', changeType: 'positive', icon: TrendingUp },
          { title: 'Payment Success Rate', value: '98.5%', change: '+0.5%', changeType: 'positive', icon: Activity },
          { title: 'Outstanding Bills', value: '$2,340', change: '-12%', changeType: 'positive', icon: FileText }
        ],
        charts: [
          {
            title: 'Revenue Trend',
            type: 'line',
            data: [
              { month: 'Jan', revenue: 35000 },
              { month: 'Feb', revenue: 38000 },
              { month: 'Mar', revenue: 42000 },
              { month: 'Apr', revenue: 40000 },
              { month: 'May', revenue: 45000 },
              { month: 'Jun', revenue: 45230 }
            ]
          }
        ]
      },
      patients: {
        stats: [
          { title: 'New Patients', value: '156', change: '+8%', changeType: 'positive', icon: Users },
          { title: 'Returning Patients', value: '1,234', change: '+12%', changeType: 'positive', icon: Activity },
          { title: 'Patient Satisfaction', value: '4.8/5', change: '+0.2', changeType: 'positive', icon: TrendingUp },
          { title: 'Average Wait Time', value: '15 min', change: '-2 min', changeType: 'positive', icon: Calendar }
        ],
        charts: [
          {
            title: 'Patient Demographics',
            type: 'doughnut',
            data: [
              { age: '0-18', count: 320 },
              { age: '19-35', count: 450 },
              { age: '36-50', count: 380 },
              { age: '51-65', count: 290 },
              { age: '65+', count: 200 }
            ]
          }
        ]
      }
    };

    return baseData[type] || baseData.overview;
  };

  const handleExportReport = (format) => {
    console.log(`Exporting ${reportType} report as ${format}`);
    // Implement actual export functionality
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

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="sm:w-48">
              <label className="label">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="input-field"
              >
                <option value="overview">Overview</option>
                <option value="revenue">Revenue</option>
                <option value="patients">Patients</option>
                <option value="appointments">Appointments</option>
                <option value="staff">Staff Performance</option>
              </select>
            </div>
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
              <label className="label">Department</label>
              <select className="input-field">
                <option value="all">All Departments</option>
                <option value="cardiology">Cardiology</option>
                <option value="pediatrics">Pediatrics</option>
                <option value="general">General Medicine</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {reports.stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <StatCard
                key={index}
                title={stat.title}
                value={stat.value}
                change={stat.change}
                changeType={stat.changeType}
                icon={Icon}
              />
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {reports.charts.map((chart, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">{chart.title}</h3>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Filter className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Chart Placeholder */}
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Chart visualization would be implemented here</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Using Chart.js or similar library
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Detailed Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activities */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm text-gray-900">New patient registered</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm text-gray-900">Payment received</p>
                  <p className="text-xs text-gray-500">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div>
                  <p className="text-sm text-gray-900">Appointment scheduled</p>
                  <p className="text-xs text-gray-500">6 hours ago</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Top Performers */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary-600">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Dr. Sarah Johnson</p>
                    <p className="text-xs text-gray-500">Cardiology</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-green-600">98%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-secondary-600">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Dr. Michael Chen</p>
                    <p className="text-xs text-gray-500">General Medicine</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-green-600">95%</span>
              </div>
            </div>
          </Card>

          {/* System Health */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Server Uptime</span>
                  <span className="text-sm font-semibold text-green-600">99.9%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '99.9%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Database Performance</span>
                  <span className="text-sm font-semibold text-green-600">98.5%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '98.5%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">API Response Time</span>
                  <span className="text-sm font-semibold text-yellow-600">150ms</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Report Templates */}
        <div className="mt-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-left">
                <h4 className="font-medium text-gray-900 mb-1">Monthly Summary</h4>
                <p className="text-sm text-gray-600">Comprehensive monthly report</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-left">
                <h4 className="font-medium text-gray-900 mb-1">Financial Report</h4>
                <p className="text-sm text-gray-600">Revenue and expense analysis</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-left">
                <h4 className="font-medium text-gray-900 mb-1">Patient Analytics</h4>
                <p className="text-sm text-gray-600">Patient flow and demographics</p>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;