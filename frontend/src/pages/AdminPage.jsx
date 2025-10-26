import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
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
  Edit,
  Calendar,
  Stethoscope
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
  const [newPatient, setNewPatient] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

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

  const handleAddPatient = async () => {
    try {
      const patientData = {
        ...newPatient,
        role: 'Patient' // Always set role to Patient
      };
      
      console.log('Sending patient data:', patientData);
      
      const response = await authService.signUp(patientData);
      
      console.log('Backend response:', response);
      
      // Add the new patient to the local state
      const addedPatient = {
        id: response.user._id,
        name: `${response.user.firstName} ${response.user.lastName}`,
        email: response.user.email,
        role: 'patient',
        status: 'active',
        department: null,
        lastLogin: new Date().toISOString()
      };
      
      setUsers(prev => [...prev, addedPatient]);
      setShowUserModal(false);
      setNewPatient({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
      });
      
      // Show success message
      console.log('Patient added successfully:', addedPatient);
      alert('Patient added successfully!');
    } catch (error) {
      console.error('Error adding patient:', error);
      alert('Error adding patient: ' + error.message);
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

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link to="/admin/appointments" className="group">
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Appointments</h3>
                    <p className="text-sm text-gray-600">Manage all appointments</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link to="/admin/patients" className="group">
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Patient Management</h3>
                    <p className="text-sm text-gray-600">Manage all registered patients</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link to="/admin/doctors" className="group">
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <Stethoscope className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Doctor Management</h3>
                    <p className="text-sm text-gray-600">Manage doctor profiles</p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </div>

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
              <h3 className="text-lg font-semibold text-gray-900">Patient Management</h3>
              <button
                onClick={() => setShowUserModal(true)}
                className="btn-primary flex items-center"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Patient
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

        {/* Add Patient Modal */}
        <Modal
          isOpen={showUserModal}
          onClose={() => {
            setShowUserModal(false);
            setSelectedUser(null);
            setNewPatient({
              firstName: '',
              lastName: '',
              email: '',
              password: ''
            });
          }}
          title="Add New Patient"
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={newPatient.firstName}
                  onChange={(e) => setNewPatient(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div>
                <label className="label">Last Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={newPatient.lastName}
                  onChange={(e) => setNewPatient(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="label">Email Address</label>
              <input 
                type="email" 
                className="input-field" 
                value={newPatient.email}
                onChange={(e) => setNewPatient(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
                required
              />
            </div>
            
            <div>
              <label className="label">Password</label>
              <input 
                type="password" 
                className="input-field" 
                value={newPatient.password}
                onChange={(e) => setNewPatient(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Minimum 6 characters"
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setSelectedUser(null);
                  setNewPatient({
                    firstName: '',
                    lastName: '',
                    email: '',
                    password: ''
                  });
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPatient}
                className="btn-primary"
                disabled={!newPatient.firstName || !newPatient.lastName || !newPatient.email || !newPatient.password}
              >
                Add Patient
              </button>
            </div>
          </div>
        </Modal>

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
  );
};

export default AdminPage;