import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, 
  Clock, 
  User, 
  Plus, 
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import Modal, { ConfirmationModal } from '../components/common/Modal';

/**
 * Appointments Page Component
 * Manage appointments with booking, rescheduling, and cancellation
 */
const AppointmentsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockAppointments = [
        {
          id: 1,
          patientName: 'John Doe',
          doctorName: 'Dr. Sarah Johnson',
          date: '2024-12-15',
          time: '10:00 AM',
          status: 'scheduled',
          reason: 'Regular checkup',
          duration: 30
        },
        {
          id: 2,
          patientName: 'Jane Smith',
          doctorName: 'Dr. Michael Chen',
          date: '2024-12-16',
          time: '2:00 PM',
          status: 'confirmed',
          reason: 'Follow-up appointment',
          duration: 45
        },
        {
          id: 3,
          patientName: 'Bob Wilson',
          doctorName: 'Dr. Emily Rodriguez',
          date: '2024-12-14',
          time: '9:00 AM',
          status: 'completed',
          reason: 'Annual physical',
          duration: 60
        }
      ];
      
      setAppointments(mockAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      // Mock doctors data
      const mockDoctors = [
        { id: 1, name: 'Dr. Sarah Johnson', specialty: 'General Medicine' },
        { id: 2, name: 'Dr. Michael Chen', specialty: 'Cardiology' },
        { id: 3, name: 'Dr. Emily Rodriguez', specialty: 'Pediatrics' }
      ];
      setDoctors(mockDoctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedAppointment) {
      setAppointments(prev => prev.filter(apt => apt.id !== selectedAppointment.id));
      setShowDeleteModal(false);
      setSelectedAppointment(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" text="Loading appointments..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
            <p className="text-gray-600 mt-2">Manage patient appointments and schedules</p>
          </div>
          <button
            onClick={() => setShowBookingModal(true)}
            className="btn-primary mt-4 sm:mt-0 flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Book Appointment
          </button>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search appointments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-field"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Appointments List */}
        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <Card className="p-8 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </Card>
          ) : (
            filteredAppointments.map((appointment) => (
              <Card key={appointment.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {appointment.patientName}
                      </h3>
                      <p className="text-gray-600">{appointment.doctorName}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-500 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {appointment.date} at {appointment.time}
                        </span>
                        <span className="text-sm text-gray-500">
                          {appointment.duration} min
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                    
                    <div className="relative">
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-gray-600">
                    <strong>Reason:</strong> {appointment.reason}
                  </p>
                </div>
                
                <div className="mt-4 flex space-x-2">
                  <button className="btn-outline text-sm px-3 py-1">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </button>
                  <button className="btn-outline text-sm px-3 py-1">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteAppointment(appointment)}
                    className="text-red-600 hover:text-red-700 text-sm px-3 py-1 py-1"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Cancel
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Booking Modal */}
        <Modal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          title="Book New Appointment"
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <label className="label">Patient</label>
              <select className="input-field">
                <option>Select Patient</option>
                <option>John Doe</option>
                <option>Jane Smith</option>
                <option>Bob Wilson</option>
              </select>
            </div>
            <div>
              <label className="label">Doctor</label>
              <select className="input-field">
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.specialty}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Date</label>
                <input type="date" className="input-field" />
              </div>
              <div>
                <label className="label">Time</label>
                <select className="input-field">
                  <option>9:00 AM</option>
                  <option>10:00 AM</option>
                  <option>11:00 AM</option>
                  <option>2:00 PM</option>
                  <option>3:00 PM</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label">Reason for Visit</label>
              <textarea 
                className="input-field" 
                rows={3}
                placeholder="Describe the reason for the appointment"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowBookingModal(false)}
                className="btn-outline"
              >
                Cancel
              </button>
              <button className="btn-primary">
                Book Appointment
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
          message={`Are you sure you want to cancel the appointment with ${selectedAppointment?.patientName}?`}
          confirmText="Cancel Appointment"
          confirmVariant="danger"
        />
      </div>
    </div>
  );
};

export default AppointmentsPage;