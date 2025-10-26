import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { appointmentService } from '../services/appointmentService';
import { authService } from '../services/authService';
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  Filter, 
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Users,
  Calendar as CalendarIcon,
  Plus,
  UserPlus
} from 'lucide-react';
import Card, { StatCard } from '../components/common/Card';
import Loader from '../components/common/Loader';
import Modal, { ConfirmationModal } from '../components/common/Modal';

/**
 * Admin Appointments Page Component
 * Comprehensive appointment management for administrators
 */
const AdminAppointmentsPage = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    status: '',
    date: '',
    doctorId: '',
    userId: '',
    page: 1,
    limit: 10
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [showAddAppointmentModal, setShowAddAppointmentModal] = useState(false);
  const [showPatientRegistrationModal, setShowPatientRegistrationModal] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    userId: '',
    doctorId: '',
    date: '',
    time: '',
    reason: ''
  });
  const [newPatient, setNewPatient] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'Patient'
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchAppointments(),
        fetchStats(),
        fetchDoctors(),
        fetchPatients()
      ]);
    } catch (error) {
      showError('Failed to load appointment data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await appointmentService.getAllAppointments(filters);
      setAppointments(response.data.appointments);
      setPagination(response.data.pagination);
    } catch (error) {
      showError(error.message);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await appointmentService.getAdminAppointmentStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await appointmentService.getDoctors();
      setDoctors(response.data);
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await appointmentService.getPatients();
      setPatients(response.data);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchTerm);
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await appointmentService.updateAppointment(appointmentId, { status: newStatus });
      showSuccess(`Appointment ${newStatus} successfully`);
      fetchAppointments();
    } catch (error) {
      showError(error.message);
    }
  };

  const handleDeleteAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedAppointment) {
      try {
        await appointmentService.cancelAppointment(selectedAppointment._id, 'Cancelled by admin');
        showSuccess('Appointment cancelled successfully');
        fetchAppointments();
        setShowDeleteModal(false);
        setSelectedAppointment(null);
      } catch (error) {
        showError(error.message);
      }
    }
  };

  const handleAddAppointment = async () => {
    try {
      await appointmentService.bookAppointment(newAppointment);
      showSuccess('Appointment created successfully');
      setShowAddAppointmentModal(false);
      setNewAppointment({
        userId: '',
        doctorId: '',
        date: '',
        time: '',
        reason: ''
      });
      fetchAppointments();
    } catch (error) {
      showError(error.message);
    }
  };

  const handlePatientRegistration = async () => {
    try {
      await authService.signUp(newPatient);
      showSuccess('Patient registered successfully');
      setShowPatientRegistrationModal(false);
      setNewPatient({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'Patient'
      });
      fetchPatients(); // Refresh patients list
    } catch (error) {
      showError(error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (time) => {
    return time;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" text="Loading appointments..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Appointment Management</h1>
              <p className="text-gray-600 mt-2">Manage all system appointments</p>
            </div>
            <button
              onClick={() => setShowAddAppointmentModal(true)}
              className="btn-primary flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Appointment
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Appointments"
              value={stats.totalAppointments}
              change="+12"
              changeType="positive"
              icon={Calendar}
            />
            <StatCard
              title="Scheduled"
              value={stats.statusBreakdown.scheduled || 0}
              change="+5"
              changeType="positive"
              icon={Clock}
            />
            <StatCard
              title="Confirmed"
              value={stats.statusBreakdown.confirmed || 0}
              change="+8"
              changeType="positive"
              icon={CheckCircle}
            />
            <StatCard
              title="Completed"
              value={stats.statusBreakdown.completed || 0}
              change="+3"
              changeType="positive"
              icon={TrendingUp}
            />
          </div>
        )}

        {/* Filters and Search */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search appointments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10 w-full"
                />
              </div>
            </form>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="input-field"
              >
                <option value="">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>

              <select
                value={filters.doctorId}
                onChange={(e) => handleFilterChange('doctorId', e.target.value)}
                className="input-field"
              >
                <option value="">All Doctors</option>
                {doctors.map(doctor => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.firstName} {doctor.lastName}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={filters.date}
                onChange={(e) => handleFilterChange('date', e.target.value)}
                className="input-field"
              />

              <select
                value={filters.limit}
                onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                className="input-field"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Appointments Table */}
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map((appointment) => (
                  <tr key={appointment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-primary-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.userId?.firstName} {appointment.userId?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {appointment.userId?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Stethoscope className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            Dr. {appointment.doctorId?.firstName} {appointment.doctorId?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {appointment.doctorId?.specialty || 'General Medicine'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <CalendarIcon className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(appointment.date)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatTime(appointment.time)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {appointment.reason}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {getStatusIcon(appointment.status)}
                        <span className="ml-1 capitalize">{appointment.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${appointment.billId?.amount || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleStatusChange(appointment._id, 'confirmed')}
                          className="text-green-600 hover:text-green-900"
                          title="Confirm"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(appointment._id, 'completed')}
                          className="text-blue-600 hover:text-blue-900"
                          title="Mark Complete"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAppointment(appointment)}
                          className="text-red-600 hover:text-red-900"
                          title="Cancel"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Showing {((pagination.currentPage - 1) * filters.limit) + 1} to{' '}
                {Math.min(pagination.currentPage * filters.limit, pagination.totalCount)} of{' '}
                {pagination.totalCount} results
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className="btn-secondary flex items-center disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </button>
                
                <span className="text-sm text-gray-700">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="btn-secondary flex items-center disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* Add Appointment Modal */}
        <Modal
          isOpen={showAddAppointmentModal}
          onClose={() => setShowAddAppointmentModal(false)}
          title="Add New Appointment"
          size="lg"
        >
          <div className="space-y-4">
            {/* Patient Selection */}
            <div>
              <label className="label">Select Patient</label>
              <select
                value={newAppointment.userId}
                onChange={(e) => setNewAppointment(prev => ({ ...prev, userId: e.target.value }))}
                className="input-field"
                required
              >
                <option value="">Choose a patient...</option>
                {patients.map(patient => (
                  <option key={patient._id} value={patient._id}>
                    {patient.firstName} {patient.lastName} ({patient.email})
                  </option>
                ))}
              </select>
              {patients.length === 0 && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    No registered patients found. 
                    <button
                      onClick={() => {
                        setShowAddAppointmentModal(false);
                        setShowPatientRegistrationModal(true);
                      }}
                      className="ml-1 text-yellow-600 hover:text-yellow-800 underline"
                    >
                      Register a new patient
                    </button>
                  </p>
                </div>
              )}
            </div>

            {/* Doctor Selection */}
            <div>
              <label className="label">Select Doctor</label>
              <select
                value={newAppointment.doctorId}
                onChange={(e) => setNewAppointment(prev => ({ ...prev, doctorId: e.target.value }))}
                className="input-field"
                required
              >
                <option value="">Choose a doctor...</option>
                {doctors.map(doctor => (
                  <option key={doctor._id} value={doctor._id}>
                    Dr. {doctor.firstName} {doctor.lastName} ({doctor.specialty || 'General Medicine'})
                  </option>
                ))}
              </select>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Date</label>
                <input
                  type="date"
                  value={newAppointment.date}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, date: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="label">Time</label>
                <select
                  value={newAppointment.time}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, time: e.target.value }))}
                  className="input-field"
                  required
                >
                  <option value="">Select time...</option>
                  <option value="9:00 AM">9:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="2:00 PM">2:00 PM</option>
                  <option value="3:00 PM">3:00 PM</option>
                </select>
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="label">Reason for Appointment</label>
              <textarea
                value={newAppointment.reason}
                onChange={(e) => setNewAppointment(prev => ({ ...prev, reason: e.target.value }))}
                className="input-field"
                rows={3}
                placeholder="Describe the reason for this appointment..."
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setShowAddAppointmentModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAppointment}
                className="btn-primary"
                disabled={!newAppointment.userId || !newAppointment.doctorId || !newAppointment.date || !newAppointment.time || !newAppointment.reason}
              >
                Create Appointment
              </button>
            </div>
          </div>
        </Modal>

        {/* Patient Registration Modal */}
        <Modal
          isOpen={showPatientRegistrationModal}
          onClose={() => setShowPatientRegistrationModal(false)}
          title="Register New Patient"
          size="lg"
        >
          <div className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First Name</label>
                <input
                  type="text"
                  value={newPatient.firstName}
                  onChange={(e) => setNewPatient(prev => ({ ...prev, firstName: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="label">Last Name</label>
                <input
                  type="text"
                  value={newPatient.lastName}
                  onChange={(e) => setNewPatient(prev => ({ ...prev, lastName: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                value={newPatient.email}
                onChange={(e) => setNewPatient(prev => ({ ...prev, email: e.target.value }))}
                className="input-field"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                value={newPatient.password}
                onChange={(e) => setNewPatient(prev => ({ ...prev, password: e.target.value }))}
                className="input-field"
                placeholder="Minimum 6 characters"
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setShowPatientRegistrationModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handlePatientRegistration}
                className="btn-primary"
                disabled={!newPatient.firstName || !newPatient.lastName || !newPatient.email || !newPatient.password}
              >
                Register Patient
              </button>
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title="Cancel Appointment"
          message={`Are you sure you want to cancel the appointment for ${selectedAppointment?.userId?.firstName} ${selectedAppointment?.userId?.lastName}?`}
          confirmText="Cancel Appointment"
          confirmVariant="danger"
        />
    </div>
  );
};

export default AdminAppointmentsPage;
