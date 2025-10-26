import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

async function testAdminAppointments() {
  try {
    console.log('Testing Admin Appointments API...');
    
    // First, login as admin to get token
    const adminCredentials = {
      email: 'admin@demo.com',
      password: 'password123'
    };
    
    const loginResponse = await axios.post(`${API_BASE_URL}/admin/login`, adminCredentials);
    const token = loginResponse.data.data.accessToken;
    
    console.log('✅ Admin login successful');
    
    // Set authorization header for subsequent requests
    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Test 1: Get all appointments
    console.log('\n1. Testing get all appointments...');
    const appointmentsResponse = await axios.get(
      `${API_BASE_URL}/admin/appointments`,
      { headers: authHeaders }
    );
    
    console.log('✅ All appointments retrieved successfully');
    console.log('Appointments count:', appointmentsResponse.data.data.appointments.length);
    console.log('Pagination:', appointmentsResponse.data.data.pagination);
    
    // Test 2: Get appointments with filters
    console.log('\n2. Testing appointments with filters...');
    const filteredResponse = await axios.get(
      `${API_BASE_URL}/admin/appointments?status=scheduled&limit=5`,
      { headers: authHeaders }
    );
    
    console.log('✅ Filtered appointments retrieved successfully');
    console.log('Filtered appointments count:', filteredResponse.data.data.appointments.length);
    
    // Test 3: Get appointment statistics
    console.log('\n3. Testing appointment statistics...');
    const statsResponse = await axios.get(
      `${API_BASE_URL}/admin/appointments/stats`,
      { headers: authHeaders }
    );
    
    console.log('✅ Appointment statistics retrieved successfully');
    console.log('Statistics:', statsResponse.data.data);
    
    // Test 4: Test unauthorized access (should fail)
    console.log('\n4. Testing unauthorized access...');
    try {
      await axios.get(`${API_BASE_URL}/admin/appointments`);
      console.log('❌ Unauthorized access should have failed!');
    } catch (error) {
      console.log('✅ Unauthorized access correctly rejected');
      console.log('Error status:', error.response?.status);
    }
    
    console.log('\n🎉 All admin appointments tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Run the test
testAdminAppointments();
