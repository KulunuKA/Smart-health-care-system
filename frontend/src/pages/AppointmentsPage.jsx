import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
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
  Eye,
} from "lucide-react";
import Card from "../components/common/Card";
import Loader from "../components/common/Loader";
import Modal, { ConfirmationModal } from "../components/common/Modal";
import { appointmentService } from "../services/appointmentService";

/**
 * Calculate appointment duration based on time slot and reason
 * @param {string} time - Time string (e.g., "9:00 AM", "2:00 PM")
 * @param {string} reason - Reason for the appointment (optional)
 * @returns {number} Duration in minutes
 */
const calculateAppointmentDuration = (time, reason = "") => {
  // Base duration based on time slots
  const timeSlotDurations = {
    "9:00 AM": 30,
    "10:00 AM": 30,
    "11:00 AM": 45,
    "2:00 PM": 30,
    "3:00 PM": 45
  };
  
  let baseDuration = timeSlotDurations[time] || 30;
  
  // Adjust duration based on reason keywords
  const reasonLower = reason.toLowerCase();
  if (reasonLower.includes("consultation") || reasonLower.includes("follow-up")) {
    baseDuration = Math.max(baseDuration, 30);
  } else if (reasonLower.includes("checkup") || reasonLower.includes("physical")) {
    baseDuration = Math.max(baseDuration, 45);
  } else if (reasonLower.includes("emergency") || reasonLower.includes("urgent")) {
    baseDuration = Math.max(baseDuration, 60);
  }
  
  return baseDuration;
};

/**
 * Calculate appointment fee based on time and reason
 * @param {string} time - Time string (e.g., "9:00 AM", "2:00 PM")
 * @param {string} reason - Reason for the appointment
 * @returns {number} Fee amount in dollars
 */
const calculateAppointmentFee = (time, reason) => {
  // Base fees for different time slots
  const timeSlotFees = {
    "9:00 AM": 50,
    "10:00 AM": 50,
    "11:00 AM": 75,
    "2:00 PM": 50,
    "3:00 PM": 75
  };
  
  let baseFee = timeSlotFees[time] || 50;
  
  // Adjust fee based on reason keywords
  const reasonLower = reason.toLowerCase();
  if (reasonLower.includes("consultation") || reasonLower.includes("follow-up")) {
    baseFee = Math.max(baseFee, 50);
  } else if (reasonLower.includes("checkup") || reasonLower.includes("physical")) {
    baseFee = Math.max(baseFee, 100);
  } else if (reasonLower.includes("emergency") || reasonLower.includes("urgent")) {
    baseFee = Math.max(baseFee, 150);
  }
  
  return baseFee;
};

/**
 * Format duration for display
 * @param {number} duration - Duration in minutes
 * @returns {string} Formatted duration string
 */
const formatDuration = (duration) => {
  if (duration < 60) {
    return `${duration} min`;
  } else {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
};

/**
 * Appointments Page Component
 * Manage appointments with booking, rescheduling, and cancellation
 */
const AppointmentsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointmentData, setAppointmentData] = useState({
    userId: user?._id,
    doctorId: "",
    date: "",
    time: "",
    reason: "",
  });
  // const { bookAppointment } = appointmentService();

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      // Fetch real appointments from the backend
      const data = await appointmentService.getUserAppointments(user?._id);
      const appointments = data.data.map(appointment => ({
        id: appointment._id,
        patientName: `${appointment.userId.firstName} ${appointment.userId.lastName}`,
        doctorName: `Dr. ${appointment.doctorId.firstName} ${appointment.doctorId.lastName}`,
        date: new Date(appointment.date).toISOString().split('T')[0],
        time: appointment.time,
        status: appointment.status,
        reason: appointment.reason,
        duration: calculateAppointmentDuration(appointment.time, appointment.reason),
        _id: appointment._id,
        userId: appointment.userId,
        doctorId: appointment.doctorId,
        billId: appointment.billId
      }));
      
      setAppointments(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      // Fallback to mock data if API fails
      const mockAppointments = [
        {
          id: 1,
          patientName: "John Doe",
          doctorName: "Dr. Sarah Johnson",
          date: "2024-12-15",
          time: "10:00 AM",
          status: "scheduled",
          reason: "Regular checkup",
          duration: calculateAppointmentDuration("10:00 AM", "Regular checkup"),
        },
        {
          id: 2,
          patientName: "Jane Smith",
          doctorName: "Dr. Michael Chen",
          date: "2024-12-16",
          time: "2:00 PM",
          status: "confirmed",
          reason: "Follow-up appointment",
          duration: calculateAppointmentDuration("2:00 PM", "Follow-up appointment"),
        },
        {
          id: 3,
          patientName: "Bob Wilson",
          doctorName: "Dr. Emily Rodriguez",
          date: "2024-12-14",
          time: "9:00 AM",
          status: "completed",
          reason: "Annual physical",
          duration: calculateAppointmentDuration("9:00 AM", "Annual physical"),
        },
      ];
      setAppointments(mockAppointments);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      // Fetch real doctors from the backend using appointment service
      const data = await appointmentService.getDoctors();
      const doctors = data.data.map(doctor => ({
        _id: doctor._id,
        name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
        specialty: doctor.specialty || 'General Medicine'
      }));
      setDoctors(doctors);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      // Fallback to mock data
      const mockDoctors = [
        { 
          _id: "507f1f77bcf86cd799439011", 
          name: "Dr. Sarah Johnson", 
          specialty: "General Medicine" 
        },
        { 
          _id: "507f1f77bcf86cd799439012", 
          name: "Dr. Michael Chen", 
          specialty: "Cardiology" 
        },
        { 
          _id: "507f1f77bcf86cd799439013", 
          name: "Dr. Emily Rodriguez", 
          specialty: "Pediatrics" 
        },
      ];
      setDoctors(mockDoctors);
    }
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.patientName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || appointment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleDeleteAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedAppointment) {
      try {
        await appointmentService.cancelAppointment(selectedAppointment._id || selectedAppointment.id, "Cancelled by user");
        setAppointments((prev) =>
          prev.filter((apt) => apt.id !== selectedAppointment.id)
        );
        setShowDeleteModal(false);
        setSelectedAppointment(null);
        // Refresh appointments list
        fetchAppointments();
        alert("Appointment cancelled successfully!");
      } catch (error) {
        console.error("Error cancelling appointment:", error);
        const errorMessage = error.message || "Failed to cancel appointment. Please try again.";
        alert(errorMessage);
      }
    }
  };

  const handleBookAppointment = async () => {
    try {
      // Validate required fields
      if (!appointmentData.doctorId || !appointmentData.date || !appointmentData.time || !appointmentData.reason) {
        alert("Please fill in all required fields");
        return;
      }

      // Prepare the payload for the backend
      const payload = {
        userId: user?._id,
        doctorId: appointmentData.doctorId,
        date: appointmentData.date,
        time: appointmentData.time,
        reason: appointmentData.reason,
      };

      console.log("Sending payload:", payload);

      const response = await appointmentService.bookAppointment(payload);
      console.log("Appointment booked successfully:", response);
      
      // Show success message with bill information
      const billAmount = response.data.billId?.amount || 0;
      alert(`Appointment booked successfully! A bill of $${billAmount} has been created and is available in the Payments section.`);
      
      setShowBookingModal(false);
      setAppointmentData({
        userId: user?._id,
        doctorId: "",
        date: "",
        time: "",
        reason: "",
      });
      
      // Refresh appointments list
      fetchAppointments();
    } catch (error) {
      console.error("Error booking appointment:", error);
      alert("Failed to book appointment. Please try again.");
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
            <p className="text-gray-600 mt-2">
              Manage patient appointments and schedules
            </p>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No appointments found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filter criteria.
              </p>
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
                          {formatDuration(appointment.duration)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        appointment.status
                      )}`}
                    >
                      {appointment.status.charAt(0).toUpperCase() +
                        appointment.status.slice(1)}
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
          onClose={() => {
            setShowBookingModal(false);
            setAppointmentData({
              userId: user?._id,
              doctorId: "",
              date: "",
              time: "",
              reason: "",
            });
          }}
          title="Book New Appointment"
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <label className="label">Patient</label>
              <input
                type="text"
                className="input-field"
                value={`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Current User'}
                disabled
              />
            </div>
            <div>
              <label className="label">Doctor *</label>
              <select
                className="input-field"
                value={appointmentData.doctorId}
                onChange={(e) =>
                  setAppointmentData({
                    ...appointmentData,
                    doctorId: e.target.value,
                  })
                }
                required
              >
                <option value="">Select a doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.name} - {doctor.specialty}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Date *</label>
                <input 
                  type="date" 
                  className="input-field"
                  value={appointmentData.date}
                  onChange={(e) =>
                    setAppointmentData({
                      ...appointmentData,
                      date: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <label className="label">Time *</label>
                <select
                  className="input-field"
                  value={appointmentData.time}
                  onChange={(e) =>
                    setAppointmentData({
                      ...appointmentData,
                      time: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">Select time</option>
                  <option value="9:00 AM">9:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="2:00 PM">2:00 PM</option>
                  <option value="3:00 PM">3:00 PM</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label">Reason for Visit *</label>
              <textarea
                className="input-field"
                rows={3}
                placeholder="Describe the reason for the appointment"
                value={appointmentData.reason}
                onChange={(e) =>
                  setAppointmentData({
                    ...appointmentData,
                    reason: e.target.value,
                  })
                }
                required
              />
            </div>
            
            {/* Fee Preview */}
            {appointmentData.time && appointmentData.reason && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-blue-900">Estimated Fee</h4>
                    <p className="text-sm text-blue-700">
                      Duration: {formatDuration(calculateAppointmentDuration(appointmentData.time, appointmentData.reason))}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-900">
                      ${calculateAppointmentFee(appointmentData.time, appointmentData.reason)}
                    </p>
                    <p className="text-sm text-blue-700">Will be billed after booking</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setAppointmentData({
                    userId: user?._id,
                    doctorId: "",
                    date: "",
                    time: "",
                    reason: "",
                  });
                }}
                className="btn-outline"
              >
                Cancel
              </button>
              <button className="btn-primary" onClick={handleBookAppointment}>
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
          message={`Are you sure you want to cancel the appointment with ${selectedAppointment?.doctorName} on ${selectedAppointment?.date} at ${selectedAppointment?.time}?`}
          confirmText="Cancel Appointment"
          confirmVariant="danger"
        />
      </div>
    </div>
  );
};

export default AppointmentsPage;
