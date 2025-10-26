// Stripe configuration
export const STRIPE_CONFIG = {
  // Stripe publishable key for frontend
  publishableKey: 'pk_test_51SMHYuRdySyDI9XcPPSa9GD90vhvj5JTq60d5XAdGhj6uWMvHeW280koLDZZgttl3mETE9cx7RfYmDog4WVVr6ICO0dqyhThES',
  
  // Stripe options
  options: {
    apiVersion: '2023-10-16',
  }
};

// Test card numbers for development
export const TEST_CARDS = {
  SUCCESS: '4242424242424242',
  DECLINED: '4000000000000002',
  REQUIRES_AUTHENTICATION: '4000002500003155',
  INSUFFICIENT_FUNDS: '4000000000009995',
  EXPIRED_CARD: '4000000000000069',
  INCORRECT_CVC: '4000000000000127'
};

export default STRIPE_CONFIG;
