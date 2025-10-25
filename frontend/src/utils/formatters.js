import { format, parseISO, isValid } from 'date-fns';

/**
 * Formatting utility functions
 * Provides data formatting helpers for the Smart Healthcare System
 */

/**
 * Formats date for display
 * @param {string|Date} date - Date to format
 * @param {string} formatString - Format string (default: 'MMM dd, yyyy')
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, formatString = 'MMM dd, yyyy') => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    return format(dateObj, formatString);
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
};

/**
 * Formats date and time for display
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted date and time string
 */
export const formatDateTime = (date) => {
  return formatDate(date, 'MMM dd, yyyy HH:mm');
};

/**
 * Formats time for display
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted time string
 */
export const formatTime = (date) => {
  return formatDate(date, 'HH:mm');
};

/**
 * Formats currency for display
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: 'USD')
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (typeof amount !== 'number' || isNaN(amount)) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

/**
 * Formats phone number for display
 * @param {string} phone - Phone number to format
 * @returns {string} - Formatted phone number
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX for US numbers
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  // Return original if not standard US format
  return phone;
};

/**
 * Formats health card number for display
 * @param {string} healthCard - Health card number to format
 * @returns {string} - Formatted health card number
 */
export const formatHealthCard = (healthCard) => {
  if (!healthCard) return '';
  
  // Format as XXXX-XXXX-XXXX
  const cleaned = healthCard.replace(/\D/g, '');
  if (cleaned.length >= 8) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8, 12)}`;
  }
  
  return healthCard;
};

/**
 * Formats file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size string
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Formats duration for display
 * @param {number} minutes - Duration in minutes
 * @returns {string} - Formatted duration string
 */
export const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
};

/**
 * Formats name for display
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @returns {string} - Formatted full name
 */
export const formatName = (firstName, lastName) => {
  const first = firstName || '';
  const last = lastName || '';
  
  if (!first && !last) return '';
  if (!first) return last;
  if (!last) return first;
  
  return `${first} ${last}`;
};

/**
 * Formats address for display
 * @param {object} address - Address object
 * @returns {string} - Formatted address string
 */
export const formatAddress = (address) => {
  if (!address) return '';
  
  const parts = [
    address.street,
    address.city,
    address.state,
    address.zipCode
  ].filter(Boolean);
  
  return parts.join(', ');
};

/**
 * Formats appointment status for display
 * @param {string} status - Appointment status
 * @returns {string} - Formatted status string
 */
export const formatAppointmentStatus = (status) => {
  const statusMap = {
    scheduled: 'Scheduled',
    confirmed: 'Confirmed',
    cancelled: 'Cancelled',
    completed: 'Completed',
    no_show: 'No Show'
  };
  
  return statusMap[status] || status;
};

/**
 * Formats payment status for display
 * @param {string} status - Payment status
 * @returns {string} - Formatted status string
 */
export const formatPaymentStatus = (status) => {
  const statusMap = {
    pending: 'Pending',
    completed: 'Completed',
    failed: 'Failed',
    refunded: 'Refunded'
  };
  
  return statusMap[status] || status;
};

/**
 * Formats role for display
 * @param {string} role - User role
 * @returns {string} - Formatted role string
 */
export const formatRole = (role) => {
  const roleMap = {
    patient: 'Patient',
    doctor: 'Doctor',
    staff: 'Staff',
    admin: 'Administrator',
    manager: 'Manager'
  };
  
  return roleMap[role] || role;
};

/**
 * Truncates text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Capitalizes first letter of each word
 * @param {string} text - Text to capitalize
 * @returns {string} - Capitalized text
 */
export const capitalizeWords = (text) => {
  if (!text) return '';
  return text.replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * Formats percentage for display
 * @param {number} value - Value to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted percentage string
 */
export const formatPercentage = (value, decimals = 1) => {
  if (typeof value !== 'number' || isNaN(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
};