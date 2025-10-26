#!/usr/bin/env node

/**
 * Stripe Checkout Integration Test Script
 * Tests the Stripe Checkout API endpoints
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testData = {
  amount: 150.00,
  productName: 'Test Appointment Payment',
  billId: 'test_bill_123',
  userId: 'test_user_123',
  doctorId: 'test_doctor_123',
  appointmentId: 'test_appointment_123',
  customerEmail: 'test@example.com'
};

/**
 * Test creating a checkout session
 */
async function testCreateCheckoutSession() {
  console.log('🧪 Testing Create Checkout Session...');
  
  try {
    const response = await fetch(`${BASE_URL}/payments/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Checkout session created successfully');
      console.log('📋 Session URL:', data.data.url);
      return data.data.url;
    } else {
      console.log('❌ Failed to create checkout session');
      console.log('📋 Error:', data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
    return null;
  }
}

/**
 * Test checkout success endpoint
 */
async function testCheckoutSuccess() {
  console.log('🧪 Testing Checkout Success Endpoint...');
  
  try {
    const response = await fetch(`${BASE_URL}/payments/checkout-success?session_id=cs_test_123&bill_id=test_bill_123`, {
      method: 'GET'
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Checkout success endpoint working');
      console.log('📋 Response:', data.message);
    } else {
      console.log('❌ Checkout success endpoint failed');
      console.log('📋 Error:', data.message);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🚀 Starting Stripe Checkout Integration Tests\n');
  
  // Test 1: Create checkout session
  const checkoutUrl = await testCreateCheckoutSession();
  console.log('');
  
  // Test 2: Test checkout success endpoint
  await testCheckoutSuccess();
  console.log('');
  
  console.log('📋 Test Summary:');
  console.log('- Create Checkout Session:', checkoutUrl ? '✅ PASS' : '❌ FAIL');
  console.log('- Checkout Success Endpoint: ✅ TESTED');
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Start your backend server: npm run dev');
  console.log('2. Start your frontend server: npm start');
  console.log('3. Navigate to http://localhost:3000/payments');
  console.log('4. Click "Pay with Stripe" button');
  console.log('5. Use test card: 4242 4242 4242 4242');
  
  console.log('\n📚 For more information, see STRIPE_INTEGRATION_README.md');
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { testCreateCheckoutSession, testCheckoutSuccess };
