import {
  isValidEmail,
  validatePassword,
  isValidPhone,
  isValidHealthCard,
  validateRequired,
  validateDate,
  validateFutureDate,
  validateAppointmentForm,
  validatePatientForm,
  validatePaymentForm,
  validateLoginForm
} from '../../utils/validators';

describe('Validation Utilities', () => {
  describe('isValidEmail', () => {
    test('validates correct email formats', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('test+tag@example.org')).toBe(true);
    });

    test('rejects invalid email formats', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    test('validates password strength', () => {
      const validResult = validatePassword('password123');
      expect(validResult.isValid).toBe(true);
      expect(validResult.message).toBe('Password is valid');
    });

    test('rejects weak passwords', () => {
      const weakResult = validatePassword('123');
      expect(weakResult.isValid).toBe(false);
      expect(weakResult.message).toContain('at least 8 characters');
    });

    test('rejects empty passwords', () => {
      const emptyResult = validatePassword('');
      expect(emptyResult.isValid).toBe(false);
      expect(emptyResult.message).toBe('Password is required');
    });
  });

  describe('isValidPhone', () => {
    test('validates phone numbers', () => {
      expect(isValidPhone('+1234567890')).toBe(true);
      expect(isValidPhone('1234567890')).toBe(true);
      expect(isValidPhone('+1-234-567-8900')).toBe(false);
    });
  });

  describe('isValidHealthCard', () => {
    test('validates health card numbers', () => {
      expect(isValidHealthCard('HC12345678')).toBe(true);
      expect(isValidHealthCard('1234567890')).toBe(true);
      expect(isValidHealthCard('HC123')).toBe(false);
      expect(isValidHealthCard('HC1234567890123')).toBe(false);
    });
  });

  describe('validateRequired', () => {
    test('validates required fields', () => {
      const validResult = validateRequired('test value', 'Test Field');
      expect(validResult.isValid).toBe(true);
      expect(validResult.message).toBe('');
    });

    test('rejects empty required fields', () => {
      const invalidResult = validateRequired('', 'Test Field');
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.message).toBe('Test Field is required');
    });

    test('rejects whitespace-only fields', () => {
      const invalidResult = validateRequired('   ', 'Test Field');
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.message).toBe('Test Field is required');
    });
  });

  describe('validateDate', () => {
    test('validates date formats', () => {
      const validResult = validateDate('2024-12-10');
      expect(validResult.isValid).toBe(true);
    });

    test('rejects invalid dates', () => {
      const invalidResult = validateDate('invalid-date');
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.message).toBe('Invalid date format');
    });
  });

  describe('validateFutureDate', () => {
    test('validates future dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const validResult = validateFutureDate(futureDate.toISOString());
      expect(validResult.isValid).toBe(true);
    });

    test('rejects past dates', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const invalidResult = validateFutureDate(pastDate.toISOString());
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.message).toBe('Date must be in the future');
    });
  });

  describe('validateAppointmentForm', () => {
    test('validates complete appointment form', () => {
      const validForm = {
        doctorId: '1',
        date: '2024-12-15',
        time: '10:00',
        reason: 'Regular checkup'
      };
      const result = validateAppointmentForm(validForm);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    test('rejects incomplete appointment form', () => {
      const invalidForm = {
        doctorId: '',
        date: '',
        time: '',
        reason: ''
      };
      const result = validateAppointmentForm(invalidForm);
      expect(result.isValid).toBe(false);
      expect(result.errors.doctorId).toBe('Please select a doctor');
      expect(result.errors.date).toBe('Date must be in the future');
      expect(result.errors.time).toBe('Please select a time slot');
      expect(result.errors.reason).toBe('Reason for appointment is required');
    });
  });

  describe('validatePatientForm', () => {
    test('validates complete patient form', () => {
      const validForm = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        healthCardNumber: 'HC12345678'
      };
      const result = validatePatientForm(validForm);
      expect(result.isValid).toBe(true);
    });

    test('validates patient form with invalid email', () => {
      const invalidForm = {
        name: 'John Doe',
        email: 'invalid-email',
        phone: '1234567890'
      };
      const result = validatePatientForm(invalidForm);
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('Invalid email format');
    });
  });

  describe('validatePaymentForm', () => {
    test('validates complete payment form', () => {
      const validForm = {
        paymentMethod: 'card',
        amount: 100.00,
        cardNumber: '1234567890123456',
        expiryDate: '12/25',
        cvv: '123'
      };
      const result = validatePaymentForm(validForm);
      expect(result.isValid).toBe(true);
    });

    test('rejects payment form with invalid amount', () => {
      const invalidForm = {
        paymentMethod: 'card',
        amount: 0
      };
      const result = validatePaymentForm(invalidForm);
      expect(result.isValid).toBe(false);
      expect(result.errors.amount).toBe('Amount must be greater than 0');
    });
  });

  describe('validateLoginForm', () => {
    test('validates complete login form', () => {
      const validForm = {
        email: 'test@example.com',
        password: 'password123'
      };
      const result = validateLoginForm(validForm);
      expect(result.isValid).toBe(true);
    });

    test('rejects login form with invalid email', () => {
      const invalidForm = {
        email: 'invalid-email',
        password: 'password123'
      };
      const result = validateLoginForm(invalidForm);
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('Invalid email format');
    });

    test('rejects login form with weak password', () => {
      const invalidForm = {
        email: 'test@example.com',
        password: '123'
      };
      const result = validateLoginForm(invalidForm);
      expect(result.isValid).toBe(false);
      expect(result.errors.password).toContain('at least 8 characters');
    });
  });
});
