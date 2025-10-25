import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, 
  Users, 
  CreditCard, 
  FileText, 
  Bell, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Heart
} from 'lucide-react';
import Card, { StatCard } from '../components/common/Card';
import Loader from '../components/common/Loader';

/**
 * Dashboard Page Component
 * Role-based dashboard with personalized content
 */
const DashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    // Simulate API call to fetch dashboard data
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data based on user role
        const mockData = getMockDashboardData(user?.role);
        setDashboardData(mockData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.role]);

  const getMockDashboardData = (role) => {
    const baseData = {
      stats: [
        { title: 'Today\'s Appointments', value: '12', change: '+2', changeType: 'positive', icon: Calendar },
        { title: 'Active Patients', value: '156', change: '+8', changeType: 'positive', icon: Users },
        { title: 'Revenue Today', value: '$2,450', change: '+15%', changeType: 'positive', icon: CreditCard },
        { title: 'System Status', value: 'Online', change: '99.9%', changeType: 'positive', icon: CheckCircle }
      ],
      recentActivities: [
        { id: 1, type: 'appointment', message: 'New appointment scheduled for 2:00 PM', time: '10 minutes ago', icon: Calendar },
        { id: 2, type: 'payment', message: 'Payment received from John Doe', time: '25 minutes ago', icon: CreditCard },
        { id: 3, type: 'record', message: 'Medical record updated for Sarah Smith', time: '1 hour ago', icon: FileText },
        { id: 4, type: 'notification', message: 'System maintenance scheduled for tonight', time: '2 hours ago', icon: Bell }
      ]
    };

    switch (role) {
      case 'patient':
        return {
          ...baseData,
          stats: [
            { title: 'Upcoming Appointments', value: '2', change: '+1', changeType: 'positive', icon: Calendar },
            { title: 'Medical Records', value: '8', change: '+2', changeType: 'positive', icon: FileText },
            { title: 'Pending Payments', value: '$150', change: '-$50', changeType: 'positive', icon: CreditCard },
            { title: 'Health Score', value: 'Good', change: '+5%', changeType: 'positive', icon: Heart }
          ],
          welcomeMessage: 'Welcome back! Here\'s your health overview.',
          quickActions: [
            { title: 'Book Appointment', description: 'Schedule your next visit', icon: Calendar, color: 'primary' },
            { title: 'View Records', description: 'Check your medical history', icon: FileText, color: 'secondary' },
            { title: 'Make Payment', description: 'Pay outstanding bills', icon: CreditCard, color: 'accent' },
            { title: 'View Notifications', description: 'Check your alerts', icon: Bell, color: 'primary' }
          ]
        };
      
      case 'doctor':
        return {
          ...baseData,
          stats: [
            { title: 'Today\'s Patients', value: '8', change: '+2', changeType: 'positive', icon: Users },
            { title: 'Appointments', value: '12', change: '+3', changeType: 'positive', icon: Calendar },
            { title: 'Records Updated', value: '15', change: '+5', changeType: 'positive', icon: FileText },
            { title: 'Patient Satisfaction', value: '4.8/5', change: '+0.2', changeType: 'positive', icon: Heart }
          ],
          welcomeMessage: 'Good morning, Dr. Smith. Here\'s your schedule overview.',
          quickActions: [
            { title: 'View Schedule', description: 'Check today\'s appointments', icon: Calendar, color: 'primary' },
            { title: 'Patient Records', description: 'Access patient information', icon: FileText, color: 'secondary' },
            { title: 'Add Notes', description: 'Update patient records', icon: FileText, color: 'accent' },
            { title: 'Reports', description: 'View analytics', icon: TrendingUp, color: 'primary' }
          ]
        };
      
      case 'admin':
        return {
          ...baseData,
          stats: [
            { title: 'Total Users', value: '1,247', change: '+23', changeType: 'positive', icon: Users },
            { title: 'System Health', value: '99.9%', change: '+0.1%', changeType: 'positive', icon: CheckCircle },
            { title: 'Revenue This Month', value: '$45,230', change: '+12%', changeType: 'positive', icon: CreditCard },
            { title: 'Active Sessions', value: '89', change: '+5', changeType: 'positive', icon: TrendingUp }
          ],
          welcomeMessage: 'System overview and management dashboard.',
          quickActions: [
            { title: 'User Management', description: 'Manage system users', icon: Users, color: 'primary' },
            { title: 'System Reports', description: 'View system analytics', icon: TrendingUp, color: 'secondary' },
            { title: 'Settings', description: 'Configure system settings', icon: AlertCircle, color: 'accent' },
            { title: 'Notifications', description: 'System notifications', icon: Bell, color: 'primary' }
          ]
        };
      
      default:
        return baseData;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {dashboardData.welcomeMessage}
          </h1>
          <p className="text-gray-600 mt-2">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardData.stats.map((stat, index) => {
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dashboardData.quickActions.map((action, index) => {
                  const Icon = action.icon;
                  const colorClasses = {
                    primary: 'bg-primary-100 text-primary-600',
                    secondary: 'bg-secondary-100 text-secondary-600',
                    accent: 'bg-accent-100 text-accent-600'
                  };
                  
                  return (
                    <button
                      key={index}
                      className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 text-left"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[action.color]}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{action.title}</h3>
                          <p className="text-sm text-gray-600">{action.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Recent Activities */}
          <div>
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activities</h2>
              <div className="space-y-4">
                {dashboardData.recentActivities.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>

        {/* Additional Role-specific Content */}
        {user?.role === 'patient' && (
          <div className="mt-8">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Health Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Heart className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-green-900">Health Score</h3>
                  <p className="text-2xl font-bold text-green-600">85/100</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-blue-900">Next Appointment</h3>
                  <p className="text-lg font-bold text-blue-600">Dec 15, 2024</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <FileText className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-purple-900">Last Checkup</h3>
                  <p className="text-lg font-bold text-purple-600">Nov 20, 2024</p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;