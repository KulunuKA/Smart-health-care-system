import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

async function testFixedSignupEndpoint() {
  try {
    console.log('Testing Fixed Signup Endpoint...');
    
    // Test 1: Register a new patient with role
    console.log('\n1. Testing patient signup with role...');
    const newPatient = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@patient.com',
      password: 'password123',
      role: 'Patient'
    };
    
    console.log('Sending data:', newPatient);
    
    const response = await axios.post(
      `${API_BASE_URL}/user/signup`,
      newPatient
    );
    
    console.log('✅ Patient registered successfully');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    // Test 2: Register without role (should default to Patient)
    console.log('\n2. Testing signup without role (should default to Patient)...');
    const newPatientNoRole = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@patient.com',
      password: 'password123'
      // No role field
    };
    
    console.log('Sending data:', newPatientNoRole);
    
    const response2 = await axios.post(
      `${API_BASE_URL}/user/signup`,
      newPatientNoRole
    );
    
    console.log('✅ Patient registered successfully (default role)');
    console.log('Response status:', response2.status);
    console.log('Response data:', JSON.stringify(response2.data, null, 2));
    
    // Test 3: Register a doctor
    console.log('\n3. Testing doctor signup...');
    const newDoctor = {
      firstName: 'Dr. Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@doctor.com',
      password: 'password123',
      role: 'Doctor'
    };
    
    console.log('Sending data:', newDoctor);
    
    const response3 = await axios.post(
      `${API_BASE_URL}/user/signup`,
      newDoctor
    );
    
    console.log('✅ Doctor registered successfully');
    console.log('Response status:', response3.status);
    console.log('Response data:', JSON.stringify(response3.data, null, 2));
    
    console.log('\n🎉 All signup tests passed!');
    console.log('\nFrontend Testing Instructions:');
    console.log('1. Login as admin: admin@demo.com / password123');
    console.log('2. Go to Admin Dashboard');
    console.log('3. Click "Add Patient" button');
    console.log('4. Fill the form and submit');
    console.log('5. Should now work without role validation error!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Run the test
testFixedSignupEndpoint();
