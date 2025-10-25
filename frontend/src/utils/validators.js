import { VALIDATION_RULES } from './constants';

/**
 * Validation utility functions
 * Provides form validation helpers for the Smart Healthcare System
 */

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
export const isValidEmail = (email) => {
  return VALIDATION_RULES.EMAIL_REGEX.test(email);
};

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {object} - Validation result with isValid and message
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  
  if (password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
    return { 
      isValid: false, 
      message: `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters long` 
    };
  }
  
  return { isValid: true, message: 'Password is valid' };
};

/**
 * Validates phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid phone format
 */
export const isValidPhone = (phone) => {
  return VALIDATION_RULES.PHONE_REGEX.test(phone);
};

/**
 * Validates health card number format
 * @param {string} healthCard - Health card number to validate
 * @returns {boolean} - True if valid health card format
 */
export const isValidHealthCard = (healthCard) => {
  return VALIDATION_RULES.HEALTH_CARD_REGEX.test(healthCard);
};

/**
 * Validates required field
 * @param {any} value - Value to validate
 * @param {string} fieldName - Name of the field for error message
 * @returns {object} - Validation result
 */
export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { isValid: false, message: `${fieldName} is required` };
  }
  return { isValid: true, message: '' };
};

/**
 * Validates date
 * @param {string|Date} date - Date to validate
 * @returns {object} - Validation result
 */
export const validateDate = (date) => {
  if (!date) {
    return { isValid: false, message: 'Date is required' };
  }
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, message: 'Invalid date format' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validates future date
 * @param {string|Date} date - Date to validate
 * @returns {object} - Validation result
 */
export const validateFutureDate = (date) => {
  const dateValidation = validateDate(date);
  if (!dateValidation.isValid) {
    return dateValidation;
  }
  
  const dateObj = new Date(date);
  const now = new Date();
  
  if (dateObj <= now) {
    return { isValid: false, message: 'Date must be in the future' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validates appointment form
 * @param {object} formData - Form data to validate
 * @returns {object} - Validation result with errors
 */
export const validateAppointmentForm = (formData) => {
  const errors = {};
  
  // Validate doctor selection
  if (!formData.doctorId) {
    errors.doctorId = 'Please select a doctor';
  }
  
  // Validate date
  const dateValidation = validateFutureDate(formData.date);
  if (!dateValidation.isValid) {
    errors.date = dateValidation.message;
  }
  
  // Validate time
  if (!formData.time) {
    errors.time = 'Please select a time slot';
  }
  
  // Validate reason
  const reasonValidation = validateRequired(formData.reason, 'Reason for appointment');
  if (!reasonValidation.isValid) {
    errors.reason = reasonValidation.message;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates patient form
 * @param {object} formData - Form data to validate
 * @returns {object} - Validation result with errors
 */
export const validatePatientForm = (formData) => {
  const errors = {};
  
  // Validate name
  const nameValidation = validateRequired(formData.name, 'Name');
  if (!nameValidation.isValid) {
    errors.name = nameValidation.message;
  }
  
  // Validate email
  if (formData.email && !isValidEmail(formData.email)) {
    errors.email = 'Invalid email format';
  }
  
  // Validate phone
  if (formData.phone && !isValidPhone(formData.phone)) {
    errors.phone = 'Invalid phone number format';
  }
  
  // Validate health card
  if (formData.healthCardNumber && !isValidHealthCard(formData.healthCardNumber)) {
    errors.healthCardNumber = 'Invalid health card number format';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates payment form
 * @param {object} formData - Form data to validate
 * @returns {object} - Validation result with errors
 */
export const validatePaymentForm = (formData) => {
  const errors = {};
  
  // Validate payment method
  if (!formData.paymentMethod) {
    errors.paymentMethod = 'Please select a payment method';
  }
  
  // Validate amount
  if (!formData.amount || formData.amount <= 0) {
    errors.amount = 'Amount must be greater than 0';
  }
  
  // Validate card details if card payment
  if (formData.paymentMethod === 'card') {
    if (!formData.cardNumber) {
      errors.cardNumber = 'Card number is required';
    }
    if (!formData.expiryDate) {
      errors.expiryDate = 'Expiry date is required';
    }
    if (!formData.cvv) {
      errors.cvv = 'CVV is required';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates login form
 * @param {object} formData - Form data to validate
 * @returns {object} - Validation result with errors
 */
export const validateLoginForm = (formData) => {
  const errors = {};
  
  // Validate email
  if (!formData.email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(formData.email)) {
    errors.email = 'Invalid email format';
  }
  
  // Validate password
  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.message;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};