import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AppointmentsPage from '../pages/AppointmentsPage';

// Mock the contexts
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1', name: 'Test User', role: 'patient' },
    isAuthenticated: true
  })
}));

jest.mock('../contexts/NotificationContext', () => ({
  useNotification: () => ({
    showSuccess: jest.fn(),
    showError: jest.fn()
  })
}));

// Mock the appointment service
jest.mock('../services/appointmentService', () => ({
  appointmentService: {
    getUserAppointments: jest.fn().mockResolvedValue([
      {
        id: '1',
        date: '2024-01-15',
        time: '10:00',
        doctor: { name: 'Dr. Smith' },
        status: 'scheduled',
        reason: 'Checkup'
      }
    ]),
    getDoctors: jest.fn().mockResolvedValue([
      {
        id: '1',
        name: 'Dr. Smith',
        specialization: 'General Medicine'
      }
    ]),
    bookAppointment: jest.fn().mockResolvedValue({}),
    cancelAppointment: jest.fn().mockResolvedValue({})
  }
}));

const MockedAppointmentsPage = () => (
  <BrowserRouter>
    <AppointmentsPage />
  </BrowserRouter>
);

describe('AppointmentsPage', () => {
  test('renders appointments page', async () => {
    render(<MockedAppointmentsPage />);
    
    expect(screen.getByText('Appointments')).toBeInTheDocument();
    expect(screen.getByText('Manage your appointments and schedule new ones')).toBeInTheDocument();
  });

  test('renders book appointment button', () => {
    render(<MockedAppointmentsPage />);
    
    expect(screen.getByRole('button', { name: /book appointment/i })).toBeInTheDocument();
  });

  test('displays appointments list', async () => {
    render(<MockedAppointmentsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
      expect(screen.getByText('2024-01-15 at 10:00')).toBeInTheDocument();
    });
  });

  test('opens booking modal when book appointment is clicked', () => {
    render(<MockedAppointmentsPage />);
    
    const bookButton = screen.getByRole('button', { name: /book appointment/i });
    fireEvent.click(bookButton);
    
    expect(screen.getByText('Book New Appointment')).toBeInTheDocument();
  });

  test('filters appointments by search term', async () => {
    render(<MockedAppointmentsPage />);
    
    const searchInput = screen.getByPlaceholderText(/search appointments/i);
    fireEvent.change(searchInput, { target: { value: 'Dr. Smith' } });
    
    await waitFor(() => {
      expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
    });
  });

  test('filters appointments by status', async () => {
    render(<MockedAppointmentsPage />);
    
    const statusFilter = screen.getByDisplayValue('All Status');
    fireEvent.change(statusFilter, { target: { value: 'scheduled' } });
    
    await waitFor(() => {
      expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
    });
  });

  test('shows no appointments message when no appointments found', async () => {
    // Mock empty appointments
    const { appointmentService } = require('../services/appointmentService');
    appointmentService.getUserAppointments.mockResolvedValueOnce([]);
    
    render(<MockedAppointmentsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('No appointments found')).toBeInTheDocument();
    });
  });
});

describe('Appointment Booking Form', () => {
  test('renders booking form fields', () => {
    render(<MockedAppointmentsPage />);
    
    const bookButton = screen.getByRole('button', { name: /book appointment/i });
    fireEvent.click(bookButton);
    
    expect(screen.getByText('Select Doctor')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Time')).toBeInTheDocument();
    expect(screen.getByText('Reason for Appointment')).toBeInTheDocument();
  });

  test('validates required fields', async () => {
    render(<MockedAppointmentsPage />);
    
    const bookButton = screen.getByRole('button', { name: /book appointment/i });
    fireEvent.click(bookButton);
    
    const submitButton = screen.getByRole('button', { name: /book appointment/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/please select a doctor/i)).toBeInTheDocument();
    });
  });

  test('submits form with valid data', async () => {
    const { appointmentService } = require('../services/appointmentService');
    
    render(<MockedAppointmentsPage />);
    
    const bookButton = screen.getByRole('button', { name: /book appointment/i });
    fireEvent.click(bookButton);
    
    // Fill form
    const doctorSelect = screen.getByDisplayValue('Choose a doctor');
    fireEvent.change(doctorSelect, { target: { value: '1' } });
    
    const dateInput = screen.getByLabelText('Date');
    fireEvent.change(dateInput, { target: { value: '2024-01-20' } });
    
    const timeSelect = screen.getByDisplayValue('Select time');
    fireEvent.change(timeSelect, { target: { value: '10:00' } });
    
    const reasonTextarea = screen.getByLabelText('Reason for Appointment');
    fireEvent.change(reasonTextarea, { target: { value: 'Regular checkup' } });
    
    const submitButton = screen.getByRole('button', { name: /book appointment/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(appointmentService.bookAppointment).toHaveBeenCalledWith({
        doctorId: '1',
        date: '2024-01-20',
        time: '10:00',
        reason: 'Regular checkup'
      });
    });
  });
});
