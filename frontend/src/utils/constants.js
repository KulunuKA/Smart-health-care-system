/**
 * Application Constants
 * Centralized constants for the Smart Healthcare System
 */

// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// User Roles
export const USER_ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  STAFF: 'staff',
  ADMIN: 'admin',
  MANAGER: 'manager'
};

// User Role Labels
export const ROLE_LABELS = {
  [USER_ROLES.PATIENT]: 'Patient',
  [USER_ROLES.DOCTOR]: 'Doctor',
  [USER_ROLES.STAFF]: 'Staff',
  [USER_ROLES.ADMIN]: 'Administrator',
  [USER_ROLES.MANAGER]: 'Manager'
};

// Appointment Status
export const APPOINTMENT_STATUS = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  NO_SHOW: 'no_show'
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

// Payment Methods
export const PAYMENT_METHODS = {
  CARD: 'card',
  BANK: 'bank',
  WALLET: 'wallet'
};

// Notification Types
export const NOTIFICATION_TYPES = {
  APPOINTMENT: 'appointment',
  PAYMENT: 'payment',
  RECORD: 'record',
  SYSTEM: 'system'
};

// Chart Types
export const CHART_TYPES = {
  LINE: 'line',
  BAR: 'bar',
  PIE: 'pie',
  DOUGHNUT: 'doughnut'
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  API: 'YYYY-MM-DD',
  DATETIME: 'MMM DD, YYYY HH:mm',
  TIME: 'HH:mm'
};

// File Types
export const FILE_TYPES = {
  PDF: 'application/pdf',
  IMAGE: 'image/*',
  DOCUMENT: 'application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 25, 50]
};

// Validation Rules
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  PHONE_REGEX: /^[\+]?[1-9][\d]{0,15}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  HEALTH_CARD_REGEX: /^[A-Z0-9]{8,12}$/
};

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/user/login',
    ADMIN_LOGIN: '/admin/login',
    LOGOUT: '/user/logout',
    REFRESH: '/user/refresh'
  },
  APPOINTMENTS: {
    BASE: '/appointments',
    AVAILABLE: '/appointments/available',
    BOOK: '/appointments/book',
    UPDATE: '/appointments/update',
    CANCEL: '/appointments/cancel',
    USER: '/appointments/user'
  },
  PATIENTS: {
    BASE: '/patients',
    UPDATE: '/patients/update',
    LIST: '/patients'
  },
  PAYMENTS: {
    UNPAID: '/payments/unpaid',
    CONFIRM: '/payments/confirm',
    HISTORY: '/payments/history'
  },
  REPORTS: {
    OVERVIEW: '/reports/overview',
    REVENUE: '/reports/revenue'
  },
  NOTIFICATIONS: {
    BASE: '/notifications',
    SEND: '/notifications/send'
  },
  ADMIN: {
    LOGS: '/admin/logs',
    SCHEDULE: '/admin/schedule',
    APPOINTMENTS: '/admin/appointments',
    APPOINTMENTS_STATS: '/admin/appointments/stats'
  }
};

// Theme Colors
export const THEME_COLORS = {
  PRIMARY: '#0ea5e9',
  SECONDARY: '#14b8a6',
  ACCENT: '#1e293b',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#3b82f6'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language'
};