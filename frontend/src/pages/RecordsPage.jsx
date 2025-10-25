import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  FileText, 
  Search, 
  Plus, 
  Download, 
  Eye, 
  Edit,
  Trash2,
  User,
  Calendar,
  AlertTriangle,
  Shield
} from 'lucide-react';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import Modal, { FormModal } from '../components/common/Modal';

/**
 * Records Page Component
 * Manage patient records and medical history
 */
const RecordsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockRecords = [
        {
          id: 1,
          patientName: 'John Doe',
          patientId: 'P001',
          healthCardNumber: 'HC123456789',
          dateOfBirth: '1985-03-15',
          gender: 'Male',
          bloodType: 'O+',
          allergies: ['Penicillin', 'Shellfish'],
          medications: ['Metformin', 'Lisinopril'],
          lastVisit: '2024-11-20',
          status: 'active'
        },
        {
          id: 2,
          patientName: 'Jane Smith',
          patientId: 'P002',
          healthCardNumber: 'HC987654321',
          dateOfBirth: '1990-07-22',
          gender: 'Female',
          bloodType: 'A+',
          allergies: ['Latex'],
          medications: ['Vitamin D', 'Iron Supplement'],
          lastVisit: '2024-12-01',
          status: 'active'
        },
        {
          id: 3,
          patientName: 'Bob Wilson',
          patientId: 'P003',
          healthCardNumber: 'HC456789123',
          dateOfBirth: '1978-12-10',
          gender: 'Male',
          bloodType: 'B+',
          allergies: [],
          medications: ['Aspirin'],
          lastVisit: '2024-10-15',
          status: 'inactive'
        }
      ];
      
      setRecords(mockRecords);
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(record =>
    record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.healthCardNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEditRecord = (record) => {
    setSelectedRecord(record);
    setShowEditModal(true);
  };

  const handleDeleteRecord = (recordId) => {
    setRecords(prev => prev.filter(record => record.id !== recordId));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" text="Loading patient records..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Patient Records</h1>
            <p className="text-gray-600 mt-2">Manage patient medical records and history</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary mt-4 sm:mt-0 flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Record
          </button>
        </div>

        {/* Search */}
        <Card className="p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by patient name, ID, or health card number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </Card>

        {/* Records List */}
        <div className="space-y-4">
          {filteredRecords.length === 0 ? (
            <Card className="p-8 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No records found</h3>
              <p className="text-gray-600">Try adjusting your search criteria.</p>
            </Card>
          ) : (
            filteredRecords.map((record) => (
              <Card key={record.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {record.patientName}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Patient ID:</span>
                          <p className="font-medium">{record.patientId}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Health Card:</span>
                          <p className="font-medium">{record.healthCardNumber}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">DOB:</span>
                          <p className="font-medium">{record.dateOfBirth}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Blood Type:</span>
                          <p className="font-medium">{record.bloodType}</p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-gray-500">Allergies:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {record.allergies.length > 0 ? (
                              record.allergies.map((allergy, index) => (
                                <span key={index} className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                                  {allergy}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-400 text-sm">None</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Current Medications:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {record.medications.map((medication, index) => (
                              <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                {medication}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            Last Visit: {record.lastVisit}
                          </span>
                          <div className="flex space-x-2">
                            <button className="text-primary-600 hover:text-primary-700 text-sm">
                              <Eye className="w-4 h-4 mr-1" />
                              View Details
                            </button>
                            <button 
                              onClick={() => handleEditRecord(record)}
                              className="text-gray-600 hover:text-gray-700 text-sm"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteRecord(record.id)}
                              className="text-red-600 hover:text-red-700 text-sm"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Add Record Modal */}
        <FormModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={(data) => {
            console.log('Add record:', data);
            setShowAddModal(false);
          }}
          title="Add New Patient Record"
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First Name</label>
                <input type="text" className="input-field" placeholder="Enter first name" />
              </div>
              <div>
                <label className="label">Last Name</label>
                <input type="text" className="input-field" placeholder="Enter last name" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Date of Birth</label>
                <input type="date" className="input-field" />
              </div>
              <div>
                <label className="label">Gender</label>
                <select className="input-field">
                  <option>Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">Health Card Number</label>
              <input type="text" className="input-field" placeholder="Enter health card number" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Blood Type</label>
                <select className="input-field">
                  <option>Select Blood Type</option>
                  <option>A+</option>
                  <option>A-</option>
                  <option>B+</option>
                  <option>B-</option>
                  <option>AB+</option>
                  <option>AB-</option>
                  <option>O+</option>
                  <option>O-</option>
                </select>
              </div>
              <div>
                <label className="label">Patient ID</label>
                <input type="text" className="input-field" placeholder="Auto-generated" disabled />
              </div>
            </div>

            <div>
              <label className="label">Allergies (comma-separated)</label>
              <input type="text" className="input-field" placeholder="e.g., Penicillin, Shellfish" />
            </div>

            <div>
              <label className="label">Current Medications (comma-separated)</label>
              <input type="text" className="input-field" placeholder="e.g., Metformin, Lisinopril" />
            </div>
          </div>
        </FormModal>

        {/* Edit Record Modal */}
        <FormModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={(data) => {
            console.log('Edit record:', data);
            setShowEditModal(false);
            setSelectedRecord(null);
          }}
          title="Edit Patient Record"
          size="lg"
        >
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Patient Name</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    defaultValue={selectedRecord.patientName}
                  />
                </div>
                <div>
                  <label className="label">Health Card Number</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    defaultValue={selectedRecord.healthCardNumber}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Blood Type</label>
                  <select className="input-field" defaultValue={selectedRecord.bloodType}>
                    <option>A+</option>
                    <option>A-</option>
                    <option>B+</option>
                    <option>B-</option>
                    <option>AB+</option>
                    <option>AB-</option>
                    <option>O+</option>
                    <option>O-</option>
                  </select>
                </div>
                <div>
                  <label className="label">Status</label>
                  <select className="input-field" defaultValue={selectedRecord.status}>
                    <option>active</option>
                    <option>inactive</option>
                    <option>archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Allergies</label>
                <input 
                  type="text" 
                  className="input-field" 
                  defaultValue={selectedRecord.allergies.join(', ')}
                />
              </div>

              <div>
                <label className="label">Medications</label>
                <input 
                  type="text" 
                  className="input-field" 
                  defaultValue={selectedRecord.medications.join(', ')}
                />
              </div>
            </div>
          )}
        </FormModal>
      </div>
    </div>
  );
};

export default RecordsPage;