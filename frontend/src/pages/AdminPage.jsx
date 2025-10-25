import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Shield, 
  Users, 
  Settings, 
  Activity, 
  Database,
  Server,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  BarChart3,
  FileText,
  UserPlus,
  Trash2,
  Edit
} from 'lucide-react';
import Card, { StatCard } from '../components/common/Card';
import Loader from '../components/common/Loader';
import Modal, { FormModal, ConfirmationModal } from '../components/common/Modal';

/**
 * Admin Page Component
 * Administrative dashboard and system management
 */
const AdminPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [systemStats, setSystemStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [systemLogs, setSystemLogs] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Simulate API calls
      await Promise.all([
        fetchSystemStats(),
        fetchUsers(),
        fetchSystemLogs()
      ]);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemStats = async () => {
    // Mock system statistics
    const mockStats = {
      stats: [
        { title: 'Total Users', value: '1,247', change: '+23', changeType: 'positive', icon: Users },
        { title: 'Active Sessions', value: '89', change: '+5', changeType: 'positive', icon: Activity },
        { title: 'System Uptime', value: '99.9%', change: '+0.1%', changeType: 'positive', icon: Server },
        { title: 'Storage Used', value: '2.4 TB', change: '+120 GB', changeType: 'neutral', icon: Database }
      ],
      systemHealth: {
        server: 99.9,
        database: 98.5,
        api: 97.8,
        storage: 85.2
      }
    };
    setSystemStats(mockStats);
  };

  const fetchUsers = async () => {
    // Mock users data
    const mockUsers = [
      {
        id: 1,
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@hospital.com',
        role: 'doctor',
        status: 'active',
        lastLogin: '2024-12-10T10:30:00Z',
        department: 'Cardiology'
      },
      {
        id: 2,
        name: 'John Doe',
        email: 'john.doe@patient.com',
        role: 'patient',
        status: 'active',
        lastLogin: '2024-12-09T14:20:00Z',
        department: null
      },
      {
        id: 3,
        name: 'Admin User',
        email: 'admin@hospital.com',
        role: 'admin',
        status: 'active',
        lastLogin: '2024-12-10T09:15:00Z',
        department: 'Administration'
      }
    ];
    setUsers(mockUsers);
  };

  const fetchSystemLogs = async () => {
    // Mock system logs
    const mockLogs = [
      {
        id: 1,
        timestamp: '2024-12-10T10:30:00Z',
        level: 'info',
        message: 'User login successful',
        user: 'Dr. Sarah Johnson',
        action: 'authentication'
      },
      {
        id: 2,
        timestamp: '2024-12-10T10:25:00Z',
        level: 'warning',
        message: 'High memory usage detected',
        user: 'System',
        action: 'system'
      },
      {
        id: 3,
        timestamp: '2024-12-10T10:20:00Z',
        level: 'error',
        message: 'Database connection timeout',
        user: 'System',
        action: 'database'
      }
    ];
    setSystemLogs(mockLogs);
  };

  const getLogLevelColor = (level) => {
    switch (level) {
      case 'info': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getLogLevelIcon = (level) => {
    switch (level) {
      case 'info': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = () => {
    if (selectedUser) {
      setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
      setShowDeleteModal(false);
      setSelectedUser(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" text="Loading admin dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">System administration and management</p>
        </div>

        {/* System Stats */}
        {systemStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {systemStats.stats.map((stat, index) => {
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
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* System Health */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">System Health</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Server Performance</span>
                  <span className="text-sm font-semibold text-green-600">{systemStats?.systemHealth.server}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${systemStats?.systemHealth.server}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Database</span>
                  <span className="text-sm font-semibold text-green-600">{systemStats?.systemHealth.database}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${systemStats?.systemHealth.database}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">API Response</span>
                  <span className="text-sm font-semibold text-yellow-600">{systemStats?.systemHealth.api}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${systemStats?.systemHealth.api}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Storage</span>
                  <span className="text-sm font-semibold text-orange-600">{systemStats?.systemHealth.storage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${systemStats?.systemHealth.storage}%` }}></div>
                </div>
              </div>
            </div>
          </Card>

          {/* User Management */}
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
              <button
                onClick={() => setShowUserModal(true)}
                className="btn-primary flex items-center"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </button>
            </div>
            
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{user.name}</h4>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.status}
                        </span>
                        <span className="text-xs text-gray-500 capitalize">{user.role}</span>
                        {user.department && (
                          <span className="text-xs text-gray-500">{user.department}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user)}
                      className="p-2 text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* System Logs */}
        <div className="mt-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">System Logs</h3>
            <div className="space-y-3">
              {systemLogs.map((log) => (
                <div key={log.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-full ${getLogLevelColor(log.level)}`}>
                    {getLogLevelIcon(log.level)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{log.message}</p>
                      <span className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-gray-500">User: {log.user}</span>
                      <span className="text-xs text-gray-500">Action: {log.action}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Add/Edit User Modal */}
        <FormModal
          isOpen={showUserModal}
          onClose={() => setShowUserModal(false)}
          onSubmit={(data) => {
            console.log('Save user:', data);
            setShowUserModal(false);
            setSelectedUser(null);
          }}
          title={selectedUser ? 'Edit User' : 'Add New User'}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  defaultValue={selectedUser?.name?.split(' ')[0] || ''}
                />
              </div>
              <div>
                <label className="label">Last Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  defaultValue={selectedUser?.name?.split(' ')[1] || ''}
                />
              </div>
            </div>
            
            <div>
              <label className="label">Email</label>
              <input 
                type="email" 
                className="input-field" 
                defaultValue={selectedUser?.email || ''}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Role</label>
                <select className="input-field" defaultValue={selectedUser?.role || ''}>
                  <option value="">Select Role</option>
                  <option value="admin">Administrator</option>
                  <option value="doctor">Doctor</option>
                  <option value="staff">Staff</option>
                  <option value="patient">Patient</option>
                </select>
              </div>
              <div>
                <label className="label">Status</label>
                <select className="input-field" defaultValue={selectedUser?.status || 'active'}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="label">Department</label>
              <select className="input-field" defaultValue={selectedUser?.department || ''}>
                <option value="">Select Department</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="General Medicine">General Medicine</option>
                <option value="Emergency">Emergency</option>
                <option value="Administration">Administration</option>
              </select>
            </div>
          </div>
        </FormModal>

        {/* Delete User Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDeleteUser}
          title="Delete User"
          message={`Are you sure you want to delete ${selectedUser?.name}? This action cannot be undone.`}
          confirmText="Delete User"
          confirmVariant="danger"
        />
      </div>
    </div>
  );
};

export default AdminPage;