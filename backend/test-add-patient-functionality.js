import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

async function testAddPatientFunctionality() {
  try {
    console.log('Testing Add Patient Functionality...');
    
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
    
    // Test 1: Add a new patient
    console.log('\n1. Testing add new patient...');
    const newPatient = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@patient.com',
      password: 'password123',
      role: 'Patient'
    };
    
    const signupResponse = await axios.post(
      `${API_BASE_URL}/user/signup`,
      newPatient
    );
    
    console.log('✅ New patient registered successfully');
    console.log('Patient ID:', signupResponse.data.data._id);
    console.log('Patient details:', {
      name: `${signupResponse.data.data.firstName} ${signupResponse.data.data.lastName}`,
      email: signupResponse.data.data.email,
      role: signupResponse.data.data.role
    });
    
    // Test 2: Add a new doctor
    console.log('\n2. Testing add new doctor...');
    const newDoctor = {
      firstName: 'Dr. Jane',
      lastName: 'Smith',
      email: 'jane.smith@doctor.com',
      password: 'password123',
      role: 'Doctor'
    };
    
    try {
      const doctorSignupResponse = await axios.post(
        `${API_BASE_URL}/user/signup`,
        newDoctor
      );
      
      console.log('✅ New doctor registered successfully');
      console.log('Doctor ID:', doctorSignupResponse.data.data._id);
      console.log('Doctor details:', {
        name: `${doctorSignupResponse.data.data.firstName} ${doctorSignupResponse.data.data.lastName}`,
        email: doctorSignupResponse.data.data.email,
        role: doctorSignupResponse.data.data.role
      });
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log('ℹ️ Doctor already exists, continuing...');
      } else {
        throw error;
      }
    }
    
    // Test 3: Add a new admin user
    console.log('\n3. Testing add new admin user...');
    const newAdmin = {
      firstName: 'Admin',
      lastName: 'User2',
      email: 'admin2@demo.com',
      password: 'password123',
      role: 'Admin'
    };
    
    try {
      const adminSignupResponse = await axios.post(
        `${API_BASE_URL}/user/signup`,
        newAdmin
      );
      
      console.log('✅ New admin registered successfully');
      console.log('Admin ID:', adminSignupResponse.data.data._id);
      console.log('Admin details:', {
        name: `${adminSignupResponse.data.data.firstName} ${adminSignupResponse.data.data.lastName}`,
        email: adminSignupResponse.data.data.email,
        role: adminSignupResponse.data.data.role
      });
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log('ℹ️ Admin already exists, continuing...');
      } else {
        throw error;
      }
    }
    
    // Test 4: Verify users can be retrieved
    console.log('\n4. Testing get all patients...');
    const patientsResponse = await axios.get(
      `${API_BASE_URL}/patients`,
      { headers: authHeaders }
    );
    
    console.log('✅ Patients retrieved successfully');
    console.log('Total patients:', patientsResponse.data.data.length);
    console.log('Patients:', patientsResponse.data.data.map(p => `${p.firstName} ${p.lastName} (${p.email})`));
    
    console.log('\n5. Testing get all doctors...');
    const doctorsResponse = await axios.get(
      `${API_BASE_URL}/doctors`,
      { headers: authHeaders }
    );
    
    console.log('✅ Doctors retrieved successfully');
    console.log('Total doctors:', doctorsResponse.data.data.length);
    console.log('Doctors:', doctorsResponse.data.data.map(d => `Dr. ${d.firstName} ${d.lastName} (${d.email})`));
    
    console.log('\n🎉 All add patient functionality tests passed!');
    console.log('\nFrontend Testing Instructions:');
    console.log('1. Login as admin: admin@demo.com / password123');
    console.log('2. Go to Admin Dashboard');
    console.log('3. In User Management section, click "Add User" button');
    console.log('4. Fill in the form:');
    console.log('   - First Name: John');
    console.log('   - Last Name: Doe');
    console.log('   - Email: john.doe@test.com');
    console.log('   - Password: password123');
    console.log('   - Role: Patient (or Doctor/Admin)');
    console.log('   - Department: (optional)');
    console.log('5. Click "Add User"');
    console.log('6. Verify the user appears in the User Management list');
    console.log('7. Test with different roles (Patient, Doctor, Admin, Staff)');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Run the test
testAddPatientFunctionality();
