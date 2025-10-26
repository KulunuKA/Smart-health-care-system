import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

async function testSimplePatientRegistration() {
  try {
    console.log('Testing Simple Patient Registration...');
    
    // Test 1: Register a new patient with minimal data
    console.log('\n1. Testing patient registration with essential fields only...');
    const newPatient = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@patient.com',
      password: 'password123',
      role: 'Patient' // This will be set automatically in the frontend
    };
    
    const signupResponse = await axios.post(
      `${API_BASE_URL}/user/signup`,
      newPatient
    );
    
    console.log('✅ Patient registered successfully');
    console.log('Patient details:', {
      id: signupResponse.data.data._id,
      name: `${signupResponse.data.data.firstName} ${signupResponse.data.data.lastName}`,
      email: signupResponse.data.data.email,
      role: signupResponse.data.data.role
    });
    
    // Test 2: Verify the patient can be retrieved
    console.log('\n2. Testing get all patients...');
    const adminCredentials = {
      email: 'admin@demo.com',
      password: 'password123'
    };
    
    const loginResponse = await axios.post(`${API_BASE_URL}/admin/login`, adminCredentials);
    const token = loginResponse.data.data.accessToken;
    
    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    const patientsResponse = await axios.get(
      `${API_BASE_URL}/patients`,
      { headers: authHeaders }
    );
    
    console.log('✅ Patients retrieved successfully');
    console.log('Total patients:', patientsResponse.data.data.length);
    console.log('Patients:', patientsResponse.data.data.map(p => `${p.firstName} ${p.lastName} (${p.email})`));
    
    console.log('\n🎉 Simple patient registration tests passed!');
    console.log('\nFrontend Testing Instructions:');
    console.log('1. Login as admin: admin@demo.com / password123');
    console.log('2. Go to Admin Dashboard');
    console.log('3. In User Management section, click "Add Patient" button');
    console.log('4. Fill in the simplified form:');
    console.log('   - First Name: Jane');
    console.log('   - Last Name: Smith');
    console.log('   - Email: jane.smith@test.com');
    console.log('   - Password: password123');
    console.log('5. Click "Add Patient"');
    console.log('6. Verify the patient appears in the User Management list');
    console.log('7. Note: Role is automatically set to "Patient"');
    console.log('8. Note: No role, status, or department fields shown');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Run the test
testSimplePatientRegistration();
