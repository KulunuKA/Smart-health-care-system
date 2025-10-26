import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  FileText, 
  Search, 
  Eye, 
  User,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import { appointmentService } from '../services/appointmentService';

/**
 * Records Page Component
 * View patient medical records and history (read-only for patients)
 */
const RecordsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('RecordsPage useEffect - user:', user);
    if (user) {
      console.log('User role:', user.role);
      if (user.role === 'Patient' || user.role === 'patient') {
        fetchMedicalRecords();
      } else {
        setError('This page is only accessible to patients');
        setLoading(false);
      }
    } else {
      setError('Please log in to view your medical records');
      setLoading(false);
    }
  }, [user]);

  const fetchMedicalRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching medical records for user:', user);
      console.log('User ID:', user._id);
      
      // For testing, let's add some mock data if the API fails
      try {
        const response = await appointmentService.getMedicalHistory(user._id);
        console.log('Fetched medical records response:', response);
        
        // Transform the medical history data to match our frontend format
        const transformedHistory = response.data.map(record => ({
          id: record._id,
          date: record.date || record.createdAt,
          type: record.recordType,
          title: record.title,
          doctor: record.doctor ? `${record.doctor.firstName} ${record.doctor.lastName}` : 'Unknown Doctor',
          status: 'Completed',
          notes: record.description,
          diagnosis: record.diagnosis,
          treatment: record.treatment,
          followUpRequired: record.followUpRequired,
          followUpDate: record.followUpDate
        }));

        console.log('Transformed medical history:', transformedHistory);
        setMedicalHistory(transformedHistory);
      } catch (apiError) {
        console.error('API Error:', apiError);
        console.log('Using mock data for testing...');
        
        // Mock data for testing
        const mockHistory = [
          {
            id: '1',
            date: new Date('2024-01-15'),
            type: 'consultation',
            title: 'Annual Checkup',
            doctor: 'Dr. Smith',
            status: 'Completed',
            notes: 'Regular annual health checkup. Patient is in good health.',
            diagnosis: 'Healthy',
            treatment: 'Continue current lifestyle',
            followUpRequired: false,
            followUpDate: null
          },
          {
            id: '2',
            date: new Date('2024-02-20'),
            type: 'diagnosis',
            title: 'Blood Test Results',
            doctor: 'Dr. Johnson',
            status: 'Completed',
            notes: 'Complete blood count and metabolic panel results.',
            diagnosis: 'Normal blood values',
            treatment: 'No treatment required',
            followUpRequired: true,
            followUpDate: new Date('2024-05-20')
          }
        ];
        
        setMedicalHistory(mockHistory);
        setError('Using mock data - API connection issue: ' + apiError.message);
      }
    } catch (error) {
      console.error('Failed to fetch medical records:', error);
      console.error('Error details:', error.message);
      setError(error.message);
      setMedicalHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecordTypeIcon = (type) => {
    switch (type) {
      case 'consultation': return <User className="w-4 h-4" />;
      case 'diagnosis': return <AlertTriangle className="w-4 h-4" />;
      case 'treatment': return <CheckCircle className="w-4 h-4" />;
      case 'prescription': return <FileText className="w-4 h-4" />;
      case 'lab_result': return <FileText className="w-4 h-4" />;
      case 'vital_signs': return <Clock className="w-4 h-4" />;
      case 'allergy': return <XCircle className="w-4 h-4" />;
      case 'medication': return <FileText className="w-4 h-4" />;
      case 'surgery': return <AlertTriangle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    setShowRecordModal(true);
  };

  const filteredRecords = medicalHistory.filter(record =>
    record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (record.diagnosis && record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" text="Loading your medical records..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Medical Records</h1>
            <p className="text-gray-600 mt-2">View your complete medical history and records</p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center gap-4">
            <span className="text-sm text-gray-500">
              Total Records: {medicalHistory.length}
            </span>
          </div>
        </div>

        {/* Search */}
        <Card className="p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search records by title, doctor, type, or diagnosis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="p-6 mb-8 border-red-200 bg-red-50">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-red-800">Error loading medical records</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <button
                  onClick={fetchMedicalRecords}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </Card>
        )}

        {/* Records List */}
        <div className="space-y-4">
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
              <Card key={record.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        {getRecordTypeIcon(record.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{record.title}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{new Date(record.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span>{record.doctor}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <span className="bg-gray-100 px-2 py-1 rounded-full">
                          {record.type.replace('_', ' ').toUpperCase()}
                        </span>
                        {record.followUpRequired && (
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                            Follow-up Required
                          </span>
                        )}
                      </div>

                      {record.diagnosis && (
                        <p className="text-sm text-gray-700 mb-2">
                          <strong>Diagnosis:</strong> {record.diagnosis}
                        </p>
                      )}

                      {record.treatment && (
                        <p className="text-sm text-gray-700 mb-3">
                          <strong>Treatment:</strong> {record.treatment}
                        </p>
                      )}

                      <p className="text-sm text-gray-600 line-clamp-2">
                        {record.notes}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewRecord(record)}
                      className="btn-secondary text-xs px-3 py-1 flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      View Details
                    </button>
                  </div>
                </div>
              </Card>
            ))
          ) : !error ? (
            <Card className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No records found' : 'No medical records yet'}
              </h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? 'Try adjusting your search terms' 
                  : 'Your medical records will appear here once they are added by healthcare providers'
                }
              </p>
            </Card>
          ) : null}
        </div>

        {/* Record Details Modal */}
        <Modal
          isOpen={showRecordModal}
          onClose={() => {
            setShowRecordModal(false);
            setSelectedRecord(null);
          }}
          title="Medical Record Details"
          size="lg"
        >
          {selectedRecord && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedRecord.title}</h3>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(selectedRecord.date).toLocaleDateString()}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{selectedRecord.doctor}</span>
                    </span>
                  </div>
                </div>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedRecord.status)}`}>
                  {selectedRecord.status}
                </span>
              </div>

              {/* Record Type */}
              <div className="flex items-center space-x-2">
                <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                  {selectedRecord.type.replace('_', ' ').toUpperCase()}
                </span>
                {selectedRecord.followUpRequired && (
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                    Follow-up Required
                  </span>
                )}
              </div>

              {/* Description */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700">{selectedRecord.notes}</p>
              </div>

              {/* Diagnosis */}
              {selectedRecord.diagnosis && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Diagnosis</h4>
                  <p className="text-gray-700">{selectedRecord.diagnosis}</p>
                </div>
              )}

              {/* Treatment */}
              {selectedRecord.treatment && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Treatment</h4>
                  <p className="text-gray-700">{selectedRecord.treatment}</p>
                </div>
              )}

              {/* Follow-up */}
              {selectedRecord.followUpRequired && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Follow-up</h4>
                  <p className="text-gray-700">
                    {selectedRecord.followUpDate 
                      ? `Scheduled for ${new Date(selectedRecord.followUpDate).toLocaleDateString()}`
                      : 'Follow-up required - please contact your healthcare provider'
                    }
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowRecordModal(false);
                    setSelectedRecord(null);
                  }}
                  className="btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default RecordsPage;