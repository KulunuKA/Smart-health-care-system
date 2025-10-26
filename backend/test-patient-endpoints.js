// Test script for patient endpoints
import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5000/api';

// Test data
const testPatientData = {
  user: "68fd13c603cd4874ca03b601", // Use existing user ID
  healthCardNumber: "HC123456789",
  dateOfBirth: "1990-01-15",
  gender: "male",
  phone: "+94771234567",
  address: {
    street: "123 Main Street",
    city: "Colombo",
    state: "Western Province",
    zipCode: "00100",
    country: "Sri Lanka"
  },
  emergencyContact: {
    name: "Jane Doe",
    relationship: "Spouse",
    phone: "+94771234568",
    email: "jane@example.com"
  }
};

const testMedicalRecord = {
  recordType: "consultation",
  title: "Initial Consultation",
  description: "Patient came for routine checkup",
  diagnosis: "Healthy",
  symptoms: ["None"],
  treatment: "No treatment required",
  vitalSigns: {
    bloodPressure: { systolic: 120, diastolic: 80 },
    heartRate: 72,
    temperature: 36.5,
    respiratoryRate: 16,
    oxygenSaturation: 98,
    weight: 70,
    height: 175,
    bmi: 22.9
  },
  followUpRequired: false,
  notes: "Patient is in good health"
};

async function testPatientEndpoints() {
  console.log("🧪 Testing Patient Endpoints...\n");

  try {
    // Test 1: Create a patient (this would need to be done through user registration first)
    console.log("1️⃣ Testing patient creation...");
    console.log("Note: Patient creation requires user registration first");
    
    // Test 2: Get patient by ID (if patient exists)
    console.log("\n2️⃣ Testing get patient by ID...");
    try {
      const response = await fetch(`${API_BASE_URL}/patients/68fd13c603cd4874ca03b601`);
      const data = await response.json();
      console.log("Response:", data);
    } catch (error) {
      console.log("Expected error (patient not found):", error.message);
    }

    // Test 3: Search patients
    console.log("\n3️⃣ Testing search patients...");
    try {
      const response = await fetch(`${API_BASE_URL}/patients/search?name=John`);
      const data = await response.json();
      console.log("Search results:", data);
    } catch (error) {
      console.log("Search error:", error.message);
    }

    // Test 4: Get patient statistics
    console.log("\n4️⃣ Testing patient statistics...");
    try {
      const response = await fetch(`${API_BASE_URL}/patients/stats`);
      const data = await response.json();
      console.log("Statistics:", data);
    } catch (error) {
      console.log("Stats error:", error.message);
    }

    // Test 5: Test medical record creation (if patient exists)
    console.log("\n5️⃣ Testing medical record creation...");
    try {
      const response = await fetch(`${API_BASE_URL}/patients/68fd13c603cd4874ca03b601/records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testMedicalRecord)
      });
      const data = await response.json();
      console.log("Medical record creation:", data);
    } catch (error) {
      console.log("Medical record error:", error.message);
    }

    console.log("\n✅ Patient endpoint tests completed!");

  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testPatientEndpoints();
