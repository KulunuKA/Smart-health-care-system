import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

// Mock the contexts to avoid authentication issues
jest.mock('../contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => <div data-testid="auth-provider">{children}</div>,
  useAuth: () => ({
    isAuthenticated: false,
    user: null,
    loading: false
  })
}));

jest.mock('../contexts/NotificationContext', () => ({
  NotificationProvider: ({ children }) => <div data-testid="notification-provider">{children}</div>,
  useNotification: () => ({
    notifications: [],
    unreadCount: 0
  })
}));

const MockedApp = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

describe('App Component', () => {
  test('renders without crashing', () => {
    render(<MockedApp />);
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
    expect(screen.getByTestId('notification-provider')).toBeInTheDocument();
  });

  test('renders navigation', () => {
    render(<MockedApp />);
    // Check if navbar is rendered
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  test('renders footer', () => {
    render(<MockedApp />);
    // Check if footer is rendered
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});