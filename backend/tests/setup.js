import mongoose from 'mongoose';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_51SMHYuRdySyDI9XcPPSa9GD90vhvj5JTq60d5XAdGhj6uWMvHeW280koLDZZgttl3mETE9cx7RfYmDog4WVVr6IC00dqyhThES';
process.env.STRIPE_SECRET_KEY = 'sk_test_51SMHYuRdySyDI9XchRsKQOVRBQsaZQWwO91b7BIFwRnvZisjo7Cjln8dDfSMaLUU6aoYBSQF3l9oaWYas8kMH2P600arfVFAAH';
process.env.FRONTEND_URL = 'http://localhost:3000';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};

// Global test timeout
jest.setTimeout(30000);

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Global teardown
afterAll(async () => {
  // Close any open handles
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});
