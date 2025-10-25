import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';

// Mock the auth context
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    user: null,
    loading: false,
    login: jest.fn()
  })
}));

jest.mock('../contexts/NotificationContext', () => ({
  useNotification: () => ({
    showSuccess: jest.fn(),
    showError: jest.fn()
  })
}));

const MockedLoginPage = () => (
  <BrowserRouter>
    <LoginPage />
  </BrowserRouter>
);

describe('LoginPage Component', () => {
  test('renders without crashing', () => {
    render(<MockedLoginPage />);
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
  });

  test('renders login form', () => {
    render(<MockedLoginPage />);
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('renders demo accounts section', () => {
    render(<MockedLoginPage />);
    expect(screen.getByText('Demo Accounts')).toBeInTheDocument();
    expect(screen.getByText('Patient:')).toBeInTheDocument();
    expect(screen.getByText('Doctor:')).toBeInTheDocument();
    expect(screen.getByText('Admin:')).toBeInTheDocument();
  });

  test('form validation works', async () => {
    render(<MockedLoginPage />);
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  test('remember me checkbox is present', () => {
    render(<MockedLoginPage />);
    expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument();
  });

  test('forgot password link is present', () => {
    render(<MockedLoginPage />);
    expect(screen.getByText(/forgot your password/i)).toBeInTheDocument();
  });
});
