import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Heart,
  Pill,
  FileText,
  Activity,
  Shield,
  Edit,
  Trash2,
  Download,
  Upload,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import Modal, { FormModal, ConfirmationModal } from '../components/common/Modal';
import { appointmentService } from '../services/appointmentService';

/**
 * User Details Page Component
 * Displays comprehensive user information including personal details, medical history, appointments, etc.
 */
const UserDetailsPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [medicalHistoryLoading, setMedicalHistoryLoading] = useState(false);
  const [showAddMedicalRecordModal, setShowAddMedicalRecordModal] = useState(false);
  const [showEditMedicalRecordModal, setShowEditMedicalRecordModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [medicalRecordData, setMedicalRecordData] = useState({
    recordType: '',
    title: '',
    description: '',
    diagnosis: '',
    symptoms: [],
    treatment: '',
    medications: [],
    vitalSigns: {},
    labResults: [],
    followUpRequired: false,
    followUpDate: '',
    notes: '',
    doctorId: ''
  });

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  useEffect(() => {
    if (activeTab === 'appointments' && userId) {
      fetchUserAppointments();
    }
  }, [activeTab, userId]);

  useEffect(() => {
    if (activeTab === 'medical' && userId) {
      fetchMedicalHistory();
    }
  }, [activeTab, userId]);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const response = await appointmentService.getUserById(userId);
      console.log('Fetched user details response:', response);
      
      // Transform the API response to match our frontend format
      const userData = response.data;
      const transformedUserDetails = {
        id: userData._id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone || 'Not provided',
        dateOfBirth: userData.dateOfBirth || 'Not provided',
        gender: userData.gender || 'Not specified',
        role: userData.role,
        status: userData.status || 'Active',
        address: userData.address || {
          street: 'Not provided',
          city: 'Not provided',
          state: 'Not provided',
          zipCode: 'Not provided',
          country: 'Not provided'
        },
        emergencyContact: userData.emergencyContact || {
          name: 'Not provided',
          relationship: 'Not provided',
          phone: 'Not provided',
          email: 'Not provided'
        },
        insurance: userData.insurance || {
          provider: 'Not provided',
          policyNumber: 'Not provided',
          groupNumber: 'Not provided',
          expiryDate: 'Not provided'
        },
        medicalHistory: userData.medicalHistory || [],
        allergies: userData.allergies || [],
        medications: userData.medications || [],
        vitalSigns: userData.vitalSigns || {
          bloodPressure: { systolic: 0, diastolic: 0 },
          heartRate: 0,
          temperature: 0,
          weight: 0,
          height: 0,
          bmi: 0
        },
        lastLogin: userData.lastLogin || new Date().toISOString(),
        createdAt: userData.createdAt || new Date().toISOString()
      };

      setUserDetails(transformedUserDetails);
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      setUserDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAppointments = async () => {
    setAppointmentsLoading(true);
    try {
      const response = await appointmentService.getUserAppointments(userId);
      console.log('Fetched user appointments response:', response);
      
      // Transform the appointments data to match our frontend format
      const transformedAppointments = response.data.map(appointment => ({
        id: appointment._id,
        date: appointment.date,
        time: appointment.time,
        doctor: appointment.doctorId ? `${appointment.doctorId.firstName} ${appointment.doctorId.lastName}` : 'Unknown Doctor',
        type: appointment.reason || 'General Consultation',
        status: appointment.status || 'Scheduled',
        reason: appointment.reason,
        notes: appointment.notes,
        createdAt: appointment.createdAt
      }));

      setAppointments(transformedAppointments);
    } catch (error) {
      console.error('Failed to fetch user appointments:', error);
      setAppointments([]);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  const handleUpdateMedicalRecord = async () => {
    try {
      // Prepare the medical record update data for the backend
      const updateData = {};

      // Only include fields that have been changed
      if (medicalRecordData.recordType) updateData.recordType = medicalRecordData.recordType;
      if (medicalRecordData.title) updateData.title = medicalRecordData.title;
      if (medicalRecordData.description) updateData.description = medicalRecordData.description;
      if (medicalRecordData.doctorId) updateData.doctor = medicalRecordData.doctorId;

      // Only add optional fields if they have values
      if (medicalRecordData.diagnosis && medicalRecordData.diagnosis.trim()) {
        updateData.diagnosis = medicalRecordData.diagnosis.trim();
      }

      if (medicalRecordData.treatment && medicalRecordData.treatment.trim()) {
        updateData.treatment = medicalRecordData.treatment.trim();
      }

      if (medicalRecordData.followUpRequired !== undefined) {
        updateData.followUpRequired = medicalRecordData.followUpRequired;
        if (medicalRecordData.followUpDate) {
          updateData.followUpDate = medicalRecordData.followUpDate;
        }
      }

      if (medicalRecordData.notes && medicalRecordData.notes.trim()) {
        updateData.notes = medicalRecordData.notes.trim();
      }

      const response = await appointmentService.updateMedicalRecord(userId, editingRecord.id, updateData);
      
      // Refresh medical history
      await fetchMedicalHistory();
      
      // Reset form and close modal
      setMedicalRecordData({
        recordType: '',
        title: '',
        description: '',
        diagnosis: '',
        symptoms: [],
        treatment: '',
        medications: [],
        vitalSigns: {},
        labResults: [],
        followUpRequired: false,
        followUpDate: '',
        notes: '',
        doctorId: ''
      });
      setEditingRecord(null);
      setShowEditMedicalRecordModal(false);
      
      alert('Medical record updated successfully!');
    } catch (error) {
      console.error('Error updating medical record:', error);
      alert('Error updating medical record: ' + error.message);
    }
  };

  const handleEditUser = () => {
    setEditData({
      firstName: userDetails.firstName,
      lastName: userDetails.lastName,
      email: userDetails.email,
      phone: userDetails.phone,
      address: userDetails.address,
      emergencyContact: userDetails.emergencyContact,
      insurance: userDetails.insurance
    });
    setShowEditModal(true);
  };

  const fetchMedicalHistory = async () => {
    setMedicalHistoryLoading(true);
    try {
      const response = await appointmentService.getMedicalHistory(userId);
      console.log('Fetched medical history response:', response);
      
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

      setMedicalHistory(transformedHistory);
    } catch (error) {
      console.error('Failed to fetch medical history:', error);
      setMedicalHistory([]);
    } finally {
      setMedicalHistoryLoading(false);
    }
  };

  const fetchDoctors = async () => {
    setDoctorsLoading(true);
    try {
      const response = await appointmentService.getDoctors();
      console.log('Fetched doctors response:', response);
      setDoctors(response.data || []);
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
      setDoctors([]);
    } finally {
      setDoctorsLoading(false);
    }
  };

  const handleAddMedicalRecord = () => {
    setShowAddMedicalRecordModal(true);
    fetchDoctors(); // Fetch doctors when modal opens
  };

  const handleEditMedicalRecord = (record) => {
    setEditingRecord(record);
    setMedicalRecordData({
      recordType: record.type || '',
      title: record.title || '',
      description: record.notes || '',
      diagnosis: record.diagnosis || '',
      symptoms: [],
      treatment: record.treatment || '',
      medications: [],
      vitalSigns: {},
      labResults: [],
      followUpRequired: record.followUpRequired || false,
      followUpDate: record.followUpDate || '',
      notes: record.notes || '',
      doctorId: record.doctorId || ''
    });
    setShowEditMedicalRecordModal(true);
    fetchDoctors(); // Fetch doctors when modal opens
  };

  const handleSaveMedicalRecord = async () => {
    try {
      // Prepare the medical record data for the backend
      const recordData = {
        recordType: medicalRecordData.recordType,
        title: medicalRecordData.title,
        description: medicalRecordData.description,
        doctor: medicalRecordData.doctorId // Add doctor ID
      };

      // Only add optional fields if they have values
      if (medicalRecordData.diagnosis && medicalRecordData.diagnosis.trim()) {
        recordData.diagnosis = medicalRecordData.diagnosis.trim();
      }

      if (medicalRecordData.treatment && medicalRecordData.treatment.trim()) {
        recordData.treatment = medicalRecordData.treatment.trim();
      }

      if (medicalRecordData.followUpRequired) {
        recordData.followUpRequired = medicalRecordData.followUpRequired;
        if (medicalRecordData.followUpDate) {
          recordData.followUpDate = medicalRecordData.followUpDate;
        }
      }

      if (medicalRecordData.notes && medicalRecordData.notes.trim()) {
        recordData.notes = medicalRecordData.notes.trim();
      }

      // Only add arrays/objects if they have content
      if (medicalRecordData.symptoms && medicalRecordData.symptoms.length > 0) {
        recordData.symptoms = medicalRecordData.symptoms;
      }

      if (medicalRecordData.medications && medicalRecordData.medications.length > 0) {
        recordData.medications = medicalRecordData.medications;
      }

      if (medicalRecordData.vitalSigns && Object.keys(medicalRecordData.vitalSigns).length > 0) {
        recordData.vitalSigns = medicalRecordData.vitalSigns;
      }

      if (medicalRecordData.labResults && medicalRecordData.labResults.length > 0) {
        recordData.labResults = medicalRecordData.labResults;
      }

      console.log('Sending medical record data:', recordData);

      // Call the backend API to add the medical record
      const response = await appointmentService.addMedicalRecord(userId, recordData);
      console.log('Medical record added successfully:', response);

      // Refresh medical history to show the new record
      await fetchMedicalHistory();

      // Reset form and close modal
      setMedicalRecordData({
        recordType: '',
        title: '',
        description: '',
        diagnosis: '',
        symptoms: [],
        treatment: '',
        medications: [],
        vitalSigns: {},
        labResults: [],
        followUpRequired: false,
        followUpDate: '',
        notes: ''
      });
      setShowAddMedicalRecordModal(false);

      // Show success message
      alert('Medical record added successfully!');
    } catch (error) {
      console.error('Error adding medical record:', error);
      alert('Error adding medical record: ' + error.message);
    }
  };

  const handleDeleteUser = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = () => {
    // Implement delete functionality
    console.log('Deleting user:', userId);
    setShowDeleteModal(false);
    navigate('/admin/patients');
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'completed':
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'severe':
        return 'bg-red-100 text-red-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'mild':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" text="Loading user details..." />
      </div>
    );
  }

  if (!userDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h2>
          <p className="text-gray-600 mb-4">The requested user could not be found.</p>
          <button
            onClick={() => navigate('/admin/patients')}
            className="btn-primary"
          >
            Back to Patients
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with Back Button */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/admin/patients')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Patients
        </button>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mr-4">
              <User className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {userDetails.firstName} {userDetails.lastName}
              </h1>
              <p className="text-gray-600 capitalize">{userDetails.role}</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleEditUser}
              className="btn-secondary flex items-center gap-2"
            >
              <Edit className="w-5 h-5" />
              Edit User
            </button>
            <button
              onClick={handleDeleteUser}
              className="btn-danger flex items-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Delete User
            </button>
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-8">
        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(userDetails.status)}`}>
          {userDetails.status}
        </span>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'medical', label: 'Medical History', icon: FileText },
            { id: 'appointments', label: 'Appointments', icon: Calendar },
            { id: 'medications', label: 'Medications', icon: Pill },
            { id: 'allergies', label: 'Allergies', icon: AlertCircle },
            { id: 'vitals', label: 'Vital Signs', icon: Activity }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">{userDetails.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">{userDetails.phone}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">{new Date(userDetails.dateOfBirth).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <User className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">{userDetails.gender}</span>
                </div>
              </div>
            </Card>

            {/* Address */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                <div>
                  <p className="text-gray-900">{userDetails.address.street}</p>
                  <p className="text-gray-900">
                    {userDetails.address.city}, {userDetails.address.state} {userDetails.address.zipCode}
                  </p>
                  <p className="text-gray-900">{userDetails.address.country}</p>
                </div>
              </div>
            </Card>

            {/* Emergency Contact */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-gray-900">{userDetails.emergencyContact.name}</p>
                  <p className="text-gray-600">{userDetails.emergencyContact.relationship}</p>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">{userDetails.emergencyContact.phone}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">{userDetails.emergencyContact.email}</span>
                </div>
              </div>
            </Card>

            {/* Insurance */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Insurance Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-gray-900">{userDetails.insurance.provider}</p>
                  <p className="text-gray-600">Policy: {userDetails.insurance.policyNumber}</p>
                </div>
                <div>
                  <p className="text-gray-600">Group: {userDetails.insurance.groupNumber}</p>
                  <p className="text-gray-600">Expires: {new Date(userDetails.insurance.expiryDate).toLocaleDateString()}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Medical History Tab */}
        {activeTab === 'medical' && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Medical History</h3>
              <button 
                onClick={handleAddMedicalRecord}
                className="btn-primary flex items-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Add Medical Record
              </button>
            </div>
            <div className="space-y-4">
              {medicalHistoryLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader size="md" text="Loading medical history..." />
                </div>
              ) : medicalHistory.length > 0 ? (
                medicalHistory.map((record) => (
                  <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{record.title}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                        <button
                          onClick={() => handleEditMedicalRecord(record)}
                          className="btn-secondary text-xs px-2 py-1 flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <p><strong>Date:</strong> {new Date(record.date).toLocaleDateString()}</p>
                        <p><strong>Doctor:</strong> {record.doctor}</p>
                      </div>
                      <div>
                        <p><strong>Type:</strong> {record.type}</p>
                        {record.followUpRequired && (
                          <p><strong>Follow-up:</strong> {record.followUpDate ? new Date(record.followUpDate).toLocaleDateString() : 'Required'}</p>
                        )}
                      </div>
                    </div>
                    {record.diagnosis && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-700"><strong>Diagnosis:</strong> {record.diagnosis}</p>
                      </div>
                    )}
                    {record.treatment && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-700"><strong>Treatment:</strong> {record.treatment}</p>
                      </div>
                    )}
                    {record.notes && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-700"><strong>Notes:</strong> {record.notes}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No medical records found</h3>
                  <p className="text-gray-500">This user has no medical records yet.</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Appointments</h3>
              <div className="flex gap-2">
                <button 
                  onClick={fetchUserAppointments}
                  className="btn-secondary flex items-center gap-2"
                  disabled={appointmentsLoading}
                >
                  <Clock className="w-5 h-5" />
                  Refresh
                </button>
                <button className="btn-primary flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Schedule Appointment
                </button>
              </div>
            </div>
            
            {/* Appointment Statistics */}
            {appointments.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="w-8 h-8 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm text-blue-600">Total</p>
                      <p className="text-2xl font-bold text-blue-900">{appointments.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm text-green-600">Completed</p>
                      <p className="text-2xl font-bold text-green-900">
                        {appointments.filter(apt => apt.status === 'completed').length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="w-8 h-8 text-yellow-600 mr-3" />
                    <div>
                      <p className="text-sm text-yellow-600">Scheduled</p>
                      <p className="text-2xl font-bold text-yellow-900">
                        {appointments.filter(apt => apt.status === 'scheduled').length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-8 h-8 text-purple-600 mr-3" />
                    <div>
                      <p className="text-sm text-purple-600">Confirmed</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {appointments.filter(apt => apt.status === 'confirmed').length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {appointmentsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader size="md" text="Loading appointments..." />
              </div>
            ) : appointments.length > 0 ? (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{appointment.type}</h4>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <p><strong>Date:</strong> {new Date(appointment.date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p><strong>Time:</strong> {appointment.time}</p>
                      </div>
                      <div>
                        <p><strong>Doctor:</strong> {appointment.doctor}</p>
                      </div>
                    </div>
                    {appointment.reason && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-700"><strong>Reason:</strong> {appointment.reason}</p>
                      </div>
                    )}
                    {appointment.notes && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-700"><strong>Notes:</strong> {appointment.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
                <p className="text-gray-500">This user has no appointments scheduled.</p>
              </div>
            )}
          </Card>
        )}

        {/* Medications Tab */}
        {activeTab === 'medications' && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Current Medications</h3>
              <button className="btn-primary flex items-center gap-2">
                <Pill className="w-5 h-5" />
                Add Medication
              </button>
            </div>
            <div className="space-y-4">
              {userDetails.medications.map((medication) => (
                <div key={medication.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{medication.name}</h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      medication.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {medication.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <p><strong>Dosage:</strong> {medication.dosage}</p>
                      <p><strong>Frequency:</strong> {medication.frequency}</p>
                    </div>
                    <div>
                      <p><strong>Prescribed by:</strong> {medication.prescribedBy}</p>
                      <p><strong>Start Date:</strong> {new Date(medication.startDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {medication.instructions && (
                    <p className="mt-2 text-sm text-gray-700"><strong>Instructions:</strong> {medication.instructions}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Allergies Tab */}
        {activeTab === 'allergies' && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Allergies</h3>
              <button className="btn-primary flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Add Allergy
              </button>
            </div>
            <div className="space-y-4">
              {userDetails.allergies.map((allergy) => (
                <div key={allergy.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{allergy.allergen}</h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(allergy.severity)}`}>
                      {allergy.severity}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p><strong>Reaction:</strong> {allergy.reaction}</p>
                    {allergy.notes && (
                      <p className="mt-1"><strong>Notes:</strong> {allergy.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Vital Signs Tab */}
        {activeTab === 'vitals' && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Vital Signs</h3>
              <button className="btn-primary flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Record Vitals
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Blood Pressure</h4>
                <p className="text-2xl font-bold text-primary-600">
                  {userDetails.vitalSigns.bloodPressure.systolic}/{userDetails.vitalSigns.bloodPressure.diastolic}
                </p>
                <p className="text-sm text-gray-600">mmHg</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Heart Rate</h4>
                <p className="text-2xl font-bold text-primary-600">{userDetails.vitalSigns.heartRate}</p>
                <p className="text-sm text-gray-600">bpm</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Temperature</h4>
                <p className="text-2xl font-bold text-primary-600">{userDetails.vitalSigns.temperature}</p>
                <p className="text-sm text-gray-600">°F</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Weight</h4>
                <p className="text-2xl font-bold text-primary-600">{userDetails.vitalSigns.weight}</p>
                <p className="text-sm text-gray-600">lbs</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Height</h4>
                <p className="text-2xl font-bold text-primary-600">{userDetails.vitalSigns.height}</p>
                <p className="text-sm text-gray-600">inches</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">BMI</h4>
                <p className="text-2xl font-bold text-primary-600">{userDetails.vitalSigns.bmi}</p>
                <p className="text-sm text-gray-600">kg/m²</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit User Information"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">First Name</label>
              <input 
                type="text" 
                className="input-field" 
                value={editData.firstName || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, firstName: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Last Name</label>
              <input 
                type="text" 
                className="input-field" 
                value={editData.lastName || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, lastName: e.target.value }))}
              />
            </div>
          </div>
          
          <div>
            <label className="label">Email Address</label>
            <input 
              type="email" 
              className="input-field" 
              value={editData.email || ''}
              onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>
          
          <div>
            <label className="label">Phone Number</label>
            <input 
              type="tel" 
              className="input-field" 
              value={editData.phone || ''}
              onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setShowEditModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // Implement update functionality
                console.log('Updating user:', editData);
                setShowEditModal(false);
              }}
              className="btn-primary"
            >
              Save Changes
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
        message={`Are you sure you want to delete ${userDetails.firstName} ${userDetails.lastName}? This action cannot be undone.`}
        confirmText="Delete User"
        confirmVariant="danger"
      />

      {/* Add Medical Record Modal */}
      <Modal
        isOpen={showAddMedicalRecordModal}
        onClose={() => {
          setShowAddMedicalRecordModal(false);
          setMedicalRecordData({
            recordType: '',
            title: '',
            description: '',
            diagnosis: '',
            symptoms: [],
            treatment: '',
            medications: [],
            vitalSigns: {},
            labResults: [],
            followUpRequired: false,
            followUpDate: '',
            notes: '',
            doctorId: ''
          });
        }}
        title="Add Medical Record"
        size="xl"
      >
        <div className="space-y-6">
          {/* Record Type and Title */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Record Type</label>
              <select 
                className="input-field"
                value={medicalRecordData.recordType}
                onChange={(e) => setMedicalRecordData(prev => ({ ...prev, recordType: e.target.value }))}
                required
              >
                <option value="">Select record type</option>
                <option value="consultation">Consultation</option>
                <option value="diagnosis">Diagnosis</option>
                <option value="treatment">Treatment</option>
                <option value="prescription">Prescription</option>
                <option value="lab_result">Lab Result</option>
                <option value="vital_signs">Vital Signs</option>
                <option value="allergy">Allergy</option>
                <option value="medication">Medication</option>
                <option value="surgery">Surgery</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="label">Title</label>
              <input 
                type="text" 
                className="input-field" 
                value={medicalRecordData.title}
                onChange={(e) => setMedicalRecordData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter record title"
                required
              />
            </div>
          </div>

          {/* Doctor Selection */}
          <div>
            <label className="label">Doctor/Laboratory</label>
            {doctorsLoading ? (
              <div className="flex items-center justify-center py-2">
                <Loader size="sm" text="Loading doctors..." />
              </div>
            ) : (
              <select 
                className="input-field"
                value={medicalRecordData.doctorId}
                onChange={(e) => setMedicalRecordData(prev => ({ ...prev, doctorId: e.target.value }))}
                required
              >
                <option value="">Select doctor or laboratory</option>
                {doctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.firstName} {doctor.lastName} - {doctor.specialization || 'General Practice'}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="label">Description</label>
            <textarea 
              className="input-field" 
              rows={4}
              value={medicalRecordData.description}
              onChange={(e) => setMedicalRecordData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter detailed description"
              required
            />
          </div>

          {/* Diagnosis and Treatment */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Diagnosis</label>
              <input 
                type="text" 
                className="input-field" 
                value={medicalRecordData.diagnosis}
                onChange={(e) => setMedicalRecordData(prev => ({ ...prev, diagnosis: e.target.value }))}
                placeholder="Enter diagnosis"
              />
            </div>
            <div>
              <label className="label">Treatment</label>
              <input 
                type="text" 
                className="input-field" 
                value={medicalRecordData.treatment}
                onChange={(e) => setMedicalRecordData(prev => ({ ...prev, treatment: e.target.value }))}
                placeholder="Enter treatment"
              />
            </div>
          </div>

          {/* Follow-up */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  className="mr-2"
                  checked={medicalRecordData.followUpRequired}
                  onChange={(e) => setMedicalRecordData(prev => ({ ...prev, followUpRequired: e.target.checked }))}
                />
                Follow-up Required
              </label>
            </div>
            {medicalRecordData.followUpRequired && (
              <div>
                <label className="label">Follow-up Date</label>
                <input 
                  type="date" 
                  className="input-field" 
                  value={medicalRecordData.followUpDate}
                  onChange={(e) => setMedicalRecordData(prev => ({ ...prev, followUpDate: e.target.value }))}
                />
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="label">Additional Notes</label>
            <textarea 
              className="input-field" 
              rows={3}
              value={medicalRecordData.notes}
              onChange={(e) => setMedicalRecordData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Enter any additional notes"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => {
                setShowAddMedicalRecordModal(false);
                setMedicalRecordData({
                  recordType: '',
                  title: '',
                  description: '',
                  diagnosis: '',
                  symptoms: [],
                  treatment: '',
                  medications: [],
                  vitalSigns: {},
                  labResults: [],
                  followUpRequired: false,
                  followUpDate: '',
                  notes: '',
                  doctorId: ''
                });
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveMedicalRecord}
              className="btn-primary"
              disabled={!medicalRecordData.recordType || !medicalRecordData.title || !medicalRecordData.description || !medicalRecordData.doctorId}
            >
              Add Medical Record
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Medical Record Modal */}
      <Modal
        isOpen={showEditMedicalRecordModal}
        onClose={() => {
          setShowEditMedicalRecordModal(false);
          setEditingRecord(null);
          setMedicalRecordData({
            recordType: '',
            title: '',
            description: '',
            diagnosis: '',
            symptoms: [],
            treatment: '',
            medications: [],
            vitalSigns: {},
            labResults: [],
            followUpRequired: false,
            followUpDate: '',
            notes: '',
            doctorId: ''
          });
        }}
        title="Edit Medical Record"
        size="xl"
      >
        <div className="space-y-6">
          {/* Record Type and Title */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Record Type</label>
              <select 
                className="input-field"
                value={medicalRecordData.recordType}
                onChange={(e) => setMedicalRecordData(prev => ({ ...prev, recordType: e.target.value }))}
              >
                <option value="">Select record type</option>
                <option value="consultation">Consultation</option>
                <option value="diagnosis">Diagnosis</option>
                <option value="treatment">Treatment</option>
                <option value="prescription">Prescription</option>
                <option value="lab_result">Lab Result</option>
                <option value="vital_signs">Vital Signs</option>
                <option value="allergy">Allergy</option>
                <option value="medication">Medication</option>
                <option value="surgery">Surgery</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="label">Title</label>
              <input 
                type="text" 
                className="input-field" 
                value={medicalRecordData.title}
                onChange={(e) => setMedicalRecordData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter record title"
              />
            </div>
          </div>

          {/* Doctor Selection */}
          <div>
            <label className="label">Doctor/Laboratory</label>
            {doctorsLoading ? (
              <div className="flex items-center justify-center py-2">
                <Loader size="sm" text="Loading doctors..." />
              </div>
            ) : (
              <select 
                className="input-field"
                value={medicalRecordData.doctorId}
                onChange={(e) => setMedicalRecordData(prev => ({ ...prev, doctorId: e.target.value }))}
              >
                <option value="">Select doctor or laboratory</option>
                {doctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.firstName} {doctor.lastName} - {doctor.specialization || 'General Practice'}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="label">Description</label>
            <textarea 
              className="input-field" 
              rows={4}
              value={medicalRecordData.description}
              onChange={(e) => setMedicalRecordData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter detailed description"
            />
          </div>

          {/* Diagnosis and Treatment */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Diagnosis</label>
              <input 
                type="text" 
                className="input-field" 
                value={medicalRecordData.diagnosis}
                onChange={(e) => setMedicalRecordData(prev => ({ ...prev, diagnosis: e.target.value }))}
                placeholder="Enter diagnosis"
              />
            </div>
            <div>
              <label className="label">Treatment</label>
              <input 
                type="text" 
                className="input-field" 
                value={medicalRecordData.treatment}
                onChange={(e) => setMedicalRecordData(prev => ({ ...prev, treatment: e.target.value }))}
                placeholder="Enter treatment"
              />
            </div>
          </div>

          {/* Follow-up */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  className="mr-2"
                  checked={medicalRecordData.followUpRequired}
                  onChange={(e) => setMedicalRecordData(prev => ({ ...prev, followUpRequired: e.target.checked }))}
                />
                Follow-up Required
              </label>
            </div>
            {medicalRecordData.followUpRequired && (
              <div>
                <label className="label">Follow-up Date</label>
                <input 
                  type="date" 
                  className="input-field" 
                  value={medicalRecordData.followUpDate}
                  onChange={(e) => setMedicalRecordData(prev => ({ ...prev, followUpDate: e.target.value }))}
                />
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="label">Additional Notes</label>
            <textarea 
              className="input-field" 
              rows={3}
              value={medicalRecordData.notes}
              onChange={(e) => setMedicalRecordData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Enter any additional notes"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => {
                setShowEditMedicalRecordModal(false);
                setEditingRecord(null);
                setMedicalRecordData({
                  recordType: '',
                  title: '',
                  description: '',
                  diagnosis: '',
                  symptoms: [],
                  treatment: '',
                  medications: [],
                  vitalSigns: {},
                  labResults: [],
                  followUpRequired: false,
                  followUpDate: '',
                  notes: '',
                  doctorId: ''
                });
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateMedicalRecord}
              className="btn-primary"
              disabled={!medicalRecordData.title || !medicalRecordData.description}
            >
              Update Medical Record
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserDetailsPage;
