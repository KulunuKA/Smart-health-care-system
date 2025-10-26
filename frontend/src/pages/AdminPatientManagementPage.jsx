import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  MoreVertical,
  Eye,
  Phone,
  Mail,
  Calendar,
  MapPin
} from 'lucide-react';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import Modal, { FormModal, ConfirmationModal } from '../components/common/Modal';
import { appointmentService } from '../services/appointmentService';

/**
 * Admin Patient Management Page Component
 * Allows admin to view, add, edit, and manage all registered patients
 */
const AdminPatientManagementPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [newPatient, setNewPatient] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    // Filter patients based on search term
    const filtered = patients.filter(patient => 
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPatients(filtered);
  }, [patients, searchTerm]);

  // const fetchPatients = async () => {
  //   setLoading(true);
  //   try {
  //     const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/user/patients`, {
  //       headers: {
  //         'Authorization': `Bearer ${localStorage.getItem('token')}`,
  //         'Content-Type': 'application/json'
  //       }
  //     });

  //     if (!response.ok) {
  //       throw new Error('Failed to fetch patients');
  //     }

  //     const data = await response.json();
  //     console.log('Fetched patients:', data);
      
  //     // Transform the data to match our expected format
  //     const transformedPatients = data.data.map(patient => ({
  //       id: patient._id,
  //       firstName: patient.firstName,
  //       lastName: patient.lastName,
  //       email: patient.email,
  //       name: `${patient.firstName} ${patient.lastName}`,
  //       role: 'patient',
  //       status: 'active',
  //       lastLogin: new Date().toISOString(),
  //       department: null
  //     }));

  //     setPatients(transformedPatients);
  //   } catch (error) {
  //     console.error('Error fetching patients:', error);
  //     // Fallback to mock data for development
  //     const mockPatients = [
  //       {
  //         id: 1,
  //         firstName: 'John',
  //         lastName: 'Doe',
  //         email: 'john.doe@patient.com',
  //         name: 'John Doe',
  //         role: 'patient',
  //         status: 'active',
  //         lastLogin: '2024-12-09T14:20:00Z',
  //         department: null
  //       },
  //       {
  //         id: 2,
  //         firstName: 'Jane',
  //         lastName: 'Smith',
  //         email: 'jane.smith@patient.com',
  //         name: 'Jane Smith',
  //         role: 'patient',
  //         status: 'active',
  //         lastLogin: '2024-12-08T10:15:00Z',
  //         department: null
  //       },
  //       {
  //         id: 3,
  //         firstName: 'Bob',
  //         lastName: 'Johnson',
  //         email: 'bob.johnson@patient.com',
  //         name: 'Bob Johnson',
  //         role: 'patient',
  //         status: 'active',
  //         lastLogin: '2024-12-07T16:30:00Z',
  //         department: null
  //       }
  //     ];
  //     setPatients(mockPatients);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await appointmentService.getPatients();
      console.log('Fetched patients response:', response);
      
      // Transform the data to match our expected format
      const transformedPatients = response.data.map(patient => ({
        id: patient._id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        name: `${patient.firstName} ${patient.lastName}`,
        role: 'patient',
        status: 'active',
        lastLogin: new Date().toISOString(),
        department: null
      }));

      setPatients(transformedPatients);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      // Set empty array on error to show no patients message
      setPatients([]);
    } finally {
      setLoading(false);
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
        firstName: response.user.firstName,
        lastName: response.user.lastName,
        email: response.user.email,
        name: `${response.user.firstName} ${response.user.lastName}`,
        role: 'patient',
        status: 'active',
        department: null,
        lastLogin: new Date().toISOString()
      };
      
      setPatients(prev => [...prev, addedPatient]);
      setShowAddModal(false);
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

  const handleEditPatient = (patient) => {
    setSelectedPatient(patient);
    setShowEditModal(true);
  };

  const handleDeletePatient = (patient) => {
    setSelectedPatient(patient);
    setShowDeleteModal(true);
  };

  const confirmDeletePatient = () => {
    if (selectedPatient) {
      setPatients(prev => prev.filter(p => p.id !== selectedPatient.id));
      setShowDeleteModal(false);
      setSelectedPatient(null);
    }
  };

  const handleViewPatient = (patient) => {
    // For now, just show patient details in an alert
    alert(`Patient Details:\nName: ${patient.name}\nEmail: ${patient.email}\nRole: ${patient.role}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" text="Loading patients..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Patient Management</h1>
        <p className="text-gray-600 mt-2">Manage all registered patients in the system</p>
      </div>

      {/* Search and Actions Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Add Patient
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Total Patients</h3>
              <p className="text-2xl font-bold text-blue-600">{patients.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Active Patients</h3>
              <p className="text-2xl font-bold text-green-600">{patients.filter(p => p.status === 'active').length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">New This Month</h3>
              <p className="text-2xl font-bold text-purple-600">0</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Patients Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                        <div className="text-sm text-gray-500 capitalize">{patient.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{patient.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      patient.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(patient.lastLogin).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleViewPatient(patient)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditPatient(patient)}
                        className="text-gray-600 hover:text-gray-900 p-1"
                        title="Edit Patient"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePatient(patient)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Delete Patient"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredPatients.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first patient.'}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Add Patient Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
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
                setShowAddModal(false);
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

      {/* Delete Patient Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeletePatient}
        title="Delete Patient"
        message={`Are you sure you want to delete ${selectedPatient?.name}? This action cannot be undone.`}
        confirmText="Delete Patient"
        confirmVariant="danger"
      />
    </div>
  );
};

export default AdminPatientManagementPage;
