import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../pages/HomePage';

const MockedHomePage = () => (
  <BrowserRouter>
    <HomePage />
  </BrowserRouter>
);

describe('HomePage Component', () => {
  test('renders without crashing', () => {
    render(<MockedHomePage />);
    expect(screen.getByText('Smart Healthcare')).toBeInTheDocument();
  });

  test('renders main heading', () => {
    render(<MockedHomePage />);
    expect(screen.getByText('Smart Healthcare')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
  });

  test('renders get started button', () => {
    render(<MockedHomePage />);
    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });

  test('renders learn more button', () => {
    render(<MockedHomePage />);
    expect(screen.getByText('Learn More')).toBeInTheDocument();
  });

  test('renders feature cards', () => {
    render(<MockedHomePage />);
    expect(screen.getByText('Appointment Management')).toBeInTheDocument();
    expect(screen.getByText('Patient Records')).toBeInTheDocument();
    expect(screen.getByText('Payment & Billing')).toBeInTheDocument();
  });

  test('renders statistics section', () => {
    render(<MockedHomePage />);
    expect(screen.getByText('Active Patients')).toBeInTheDocument();
    expect(screen.getByText('Appointments Today')).toBeInTheDocument();
    expect(screen.getByText('Revenue This Month')).toBeInTheDocument();
  });
});
