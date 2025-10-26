import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

async function testAddAppointmentFlow() {
  try {
    console.log('Testing Add Appointment Flow...');
    
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
    
    // Test 1: Get all patients
    console.log('\n1. Testing get all patients...');
    const patientsResponse = await axios.get(
      `${API_BASE_URL}/patients`,
      { headers: authHeaders }
    );
    
    console.log('✅ Patients retrieved successfully');
    console.log('Patients count:', patientsResponse.data.data.length);
    console.log('Patients:', patientsResponse.data.data.map(p => `${p.firstName} ${p.lastName}`));
    
    // Test 2: Get all doctors
    console.log('\n2. Testing get all doctors...');
    const doctorsResponse = await axios.get(
      `${API_BASE_URL}/doctors`,
      { headers: authHeaders }
    );
    
    console.log('✅ Doctors retrieved successfully');
    console.log('Doctors count:', doctorsResponse.data.data.length);
    console.log('Doctors:', doctorsResponse.data.data.map(d => `Dr. ${d.firstName} ${d.lastName}`));
    
    // Test 3: Register a new patient (if needed)
    console.log('\n3. Testing patient registration...');
    const newPatient = {
      firstName: 'Test',
      lastName: 'Patient',
      email: 'testpatient@demo.com',
      password: 'password123',
      role: 'Patient'
    };
    
    try {
      const signupResponse = await axios.post(
        `${API_BASE_URL}/user/signup`,
        newPatient
      );
      console.log('✅ New patient registered successfully');
      console.log('Patient ID:', signupResponse.data.data._id);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log('ℹ️ Patient already exists, continuing...');
      } else {
        throw error;
      }
    }
    
    // Test 4: Book an appointment
    console.log('\n4. Testing appointment booking...');
    const appointmentData = {
      userId: patientsResponse.data.data[0]._id, // Use first patient
      doctorId: doctorsResponse.data.data[0]._id, // Use first doctor
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Next week
      time: '10:00 AM',
      reason: 'Regular checkup'
    };
    
    const appointmentResponse = await axios.post(
      `${API_BASE_URL}/appointments/book`,
      appointmentData,
      { headers: authHeaders }
    );
    
    console.log('✅ Appointment booked successfully');
    console.log('Appointment ID:', appointmentResponse.data.data._id);
    console.log('Appointment details:', {
      patient: `${appointmentResponse.data.data.userId.firstName} ${appointmentResponse.data.data.userId.lastName}`,
      doctor: `Dr. ${appointmentResponse.data.data.doctorId.firstName} ${appointmentResponse.data.data.doctorId.lastName}`,
      date: appointmentResponse.data.data.date,
      time: appointmentResponse.data.data.time,
      reason: appointmentResponse.data.data.reason
    });
    
    console.log('\n🎉 All add appointment flow tests passed!');
    console.log('\nFrontend Testing Instructions:');
    console.log('1. Login as admin: admin@demo.com / password123');
    console.log('2. Go to Admin Appointments page');
    console.log('3. Click "Add Appointment" button');
    console.log('4. Select patient from dropdown');
    console.log('5. Select doctor from dropdown');
    console.log('6. Choose date and time');
    console.log('7. Enter reason for appointment');
    console.log('8. Click "Create Appointment"');
    console.log('9. If no patients exist, click "Register a new patient"');
    console.log('10. Fill patient registration form and submit');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Run the test
testAddAppointmentFlow();
