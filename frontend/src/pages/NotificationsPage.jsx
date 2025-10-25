import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { 
  Bell, 
  Search, 
  Filter,
  CheckCircle,
  Trash2,
  Settings,
  Mail,
  Smartphone,
  AlertCircle,
  Clock,
  Info
} from 'lucide-react';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import Modal, { FormModal } from '../components/common/Modal';

/**
 * Notifications Page Component
 * Manage and view all notifications
 */
const NotificationsPage = () => {
  const { user } = useAuth();
  const { notifications, markAsRead, markAllAsRead, loadNotifications } = useNotification();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  useEffect(() => {
    loadNotifications();
    setLoading(false);
  }, [loadNotifications]);

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || notification.type === filterType;
    return matchesSearch && matchesType;
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment': return <Clock className="w-5 h-5 text-blue-600" />;
      case 'payment': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'record': return <Info className="w-5 h-5 text-purple-600" />;
      case 'system': return <AlertCircle className="w-5 h-5 text-orange-600" />;
      default: return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'appointment': return 'bg-blue-100 border-blue-200';
      case 'payment': return 'bg-green-100 border-green-200';
      case 'record': return 'bg-purple-100 border-purple-200';
      case 'system': return 'bg-orange-100 border-orange-200';
      default: return 'bg-gray-100 border-gray-200';
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    await markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleDeleteNotification = (notificationId) => {
    // Implement delete functionality
    console.log('Delete notification:', notificationId);
  };

  const notificationTypes = [
    { value: 'all', label: 'All Notifications' },
    { value: 'appointment', label: 'Appointments' },
    { value: 'payment', label: 'Payments' },
    { value: 'record', label: 'Medical Records' },
    { value: 'system', label: 'System' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" text="Loading notifications..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-2">Manage your notifications and alerts</p>
          </div>
          <div className="flex space-x-2 mt-4 sm:mt-0">
            <button
              onClick={handleMarkAllAsRead}
              className="btn-outline flex items-center"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark All Read
            </button>
            <button
              onClick={() => setShowSettingsModal(true)}
              className="btn-outline flex items-center"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </button>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="input-field"
              >
                {notificationTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card className="p-8 text-center">
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-600">You're all caught up! No new notifications.</p>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`p-6 border-l-4 ${getNotificationColor(notification.type)} ${
                  !notification.read ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-lg font-semibold ${
                        !notification.read ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {notification.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                        <span className="text-sm text-gray-500">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mt-1">{notification.message}</p>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500 capitalize">
                          {notification.type}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(notification.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-sm text-blue-600 hover:text-blue-700"
                          >
                            Mark as read
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteNotification(notification.id)}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Notification Settings Modal */}
        <FormModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          onSubmit={(data) => {
            console.log('Update notification settings:', data);
            setShowSettingsModal(false);
          }}
          title="Notification Settings"
          size="lg"
        >
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Types</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-3" />
                  <div className="flex items-center">
                    <Bell className="w-4 h-4 mr-2 text-blue-600" />
                    <span>Appointment notifications</span>
                  </div>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-3" />
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    <span>Payment notifications</span>
                  </div>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-3" />
                  <div className="flex items-center">
                    <Info className="w-4 h-4 mr-2 text-purple-600" />
                    <span>Medical record updates</span>
                  </div>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-3" />
                  <div className="flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2 text-orange-600" />
                    <span>System notifications</span>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Methods</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-3" />
                  <div className="flex items-center">
                    <Bell className="w-4 h-4 mr-2 text-gray-600" />
                    <span>In-app notifications</span>
                  </div>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-3" />
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-gray-600" />
                    <span>Email notifications</span>
                  </div>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-3" />
                  <div className="flex items-center">
                    <Smartphone className="w-4 h-4 mr-2 text-gray-600" />
                    <span>SMS notifications</span>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Frequency</h3>
              <select className="input-field">
                <option>Immediate</option>
                <option>Daily digest</option>
                <option>Weekly summary</option>
                <option>Only important</option>
              </select>
            </div>
          </div>
        </FormModal>
      </div>
    </div>
  );
};

export default NotificationsPage;