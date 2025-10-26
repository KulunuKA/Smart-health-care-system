import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

async function testBackendSignupEndpoint() {
  try {
    console.log('Testing Backend Signup Endpoint...');
    
    // Test 1: Register a new patient
    console.log('\n1. Testing patient signup...');
    const newPatient = {
      firstName: 'Test',
      lastName: 'Patient',
      email: 'testpatient@example.com',
      password: 'password123',
      role: 'Patient'
    };
    
    console.log('Sending data:', newPatient);
    
    const response = await axios.post(
      `${API_BASE_URL}/user/signup`,
      newPatient
    );
    
    console.log('✅ Backend response received');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    // Test 2: Try to register same patient again (should fail)
    console.log('\n2. Testing duplicate email...');
    try {
      await axios.post(
        `${API_BASE_URL}/user/signup`,
        newPatient
      );
      console.log('❌ Duplicate email should have failed!');
    } catch (error) {
      console.log('✅ Duplicate email correctly rejected');
      console.log('Error status:', error.response?.status);
      console.log('Error message:', error.response?.data?.message);
    }
    
    console.log('\n🎉 Backend signup endpoint tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Run the test
testBackendSignupEndpoint();
