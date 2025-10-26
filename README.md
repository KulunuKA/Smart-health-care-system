# Smart Healthcare System API

A comprehensive REST API for managing healthcare operations including patient records, appointments, payments, and user authentication.

## 🚀 Base URL
```
http://localhost:5000/api
```

## 📋 Table of Contents
- [Authentication Endpoints](#authentication-endpoints)
- [Patient Management Endpoints](#patient-management-endpoints)
- [Appointment Management Endpoints](#appointment-management-endpoints)
- [Payment Management Endpoints](#payment-management-endpoints)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Authentication](#authentication)

---

## Authentication Endpoints

### User Registration
**POST** `/user/signup`

Creates a new user account in the system.

**Request Body:**
```json
{
  "role": "Patient|Doctor|Admin|Customer",
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Purpose:** Register new users with role-based access control.

---

### User Login
**POST** `/user/login`

Authenticates user and returns access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Purpose:** User authentication and session management.

---

### User Logout
**POST** `/user/logout`

Logs out the current user and invalidates session.

**Purpose:** Secure user session termination.

---

### Get Doctors
**GET** `/doctors`

Retrieves list of all available doctors.

**Purpose:** Fetch doctor information for appointment booking.

---

## Patient Management Endpoints

### Get Patient by ID
**GET** `/:patientId`

Retrieves detailed patient information by patient ID.

**Purpose:** Access individual patient records and profile information.

---

### Get Patient by Health Card
**GET** `/health-card/:healthCardNumber`

Retrieves patient information using health card number.

**Purpose:** Quick patient lookup using health card identification.

---

### Update Patient Record
**PUT** `/:patientId`

Updates patient profile and medical information.

**Request Body:**
```json
{
  "healthCardNumber": "HC123456789",
  "dateOfBirth": "1990-01-01",
  "gender": "male|female|other",
  "phone": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "Colombo",
    "state": "Western",
    "zipCode": "10000",
    "country": "Sri Lanka"
  },
  "emergencyContact": {
    "name": "Jane Doe",
    "relationship": "Spouse",
    "phone": "+1234567891",
    "email": "jane@example.com"
  },
  "insurance": {
    "provider": "Insurance Co",
    "policyNumber": "POL123456",
    "groupNumber": "GRP789",
    "expiryDate": "2024-12-31"
  },
  "status": "active|inactive|suspended"
}
```

**Purpose:** Maintain up-to-date patient information and contact details.

---

### Get Medical History
**GET** `/:patientId/history`

Retrieves complete medical history for a patient.

**Purpose:** Access comprehensive medical records for clinical decision making.

---

### Add Medical Record
**POST** `/:patientId/records`

Adds a new medical record entry for the patient.

**Request Body:**
```json
{
  "recordType": "consultation|diagnosis|treatment|prescription|lab_result|vital_signs|allergy|medication|surgery|other",
  "title": "Record Title",
  "description": "Detailed description",
  "diagnosis": "Medical diagnosis",
  "symptoms": ["symptom1", "symptom2"],
  "treatment": "Treatment details",
  "medications": [
    {
      "name": "Medication Name",
      "dosage": "10mg",
      "frequency": "Twice daily",
      "duration": "7 days",
      "instructions": "Take with food"
    }
  ],
  "vitalSigns": {
    "bloodPressure": {
      "systolic": 120,
      "diastolic": 80
    },
    "heartRate": 72,
    "temperature": 36.5,
    "respiratoryRate": 16,
    "oxygenSaturation": 98,
    "weight": 70,
    "height": 175,
    "bmi": 22.9
  },
  "labResults": [
    {
      "testName": "Blood Sugar",
      "result": "95",
      "normalRange": "70-100",
      "unit": "mg/dL",
      "status": "normal"
    }
  ],
  "followUpRequired": true,
  "followUpDate": "2024-02-01",
  "notes": "Additional notes"
}
```

**Purpose:** Document medical consultations, treatments, and clinical findings.

---

### Update Medical Record
**PUT** `/:patientId/records/:recordId`

Updates an existing medical record entry.

**Purpose:** Modify or correct medical record information.

---

### Delete Medical Record
**DELETE** `/:patientId/records/:recordId`

Removes a medical record entry.

**Purpose:** Remove incorrect or outdated medical records.

---

### Get Patient Allergies
**GET** `/:patientId/allergies`

Retrieves all known allergies for the patient.

**Purpose:** Access critical allergy information for safe treatment.

---

### Update Patient Allergies
**PUT** `/:patientId/allergies`

Updates patient allergy information.

**Request Body:**
```json
[
  {
    "allergen": "Penicillin",
    "severity": "severe",
    "reaction": "Anaphylaxis",
    "notes": "Life-threatening reaction"
  }
]
```

**Purpose:** Maintain accurate allergy records for patient safety.

---

### Get Patient Medications
**GET** `/:patientId/medications`

Retrieves current and past medications for the patient.

**Purpose:** Track medication history and current prescriptions.

---

### Update Patient Medications
**PUT** `/:patientId/medications`

Updates patient medication information.

**Request Body:**
```json
[
  {
    "name": "Aspirin",
    "dosage": "100mg",
    "frequency": "Once daily",
    "startDate": "2024-01-01",
    "endDate": "2024-02-01",
    "prescribedBy": "Dr. Smith",
    "instructions": "Take with food",
    "isActive": true
  }
]
```

**Purpose:** Manage medication records and prescriptions.

---

### Get Patient Statistics
**GET** `/stats`

Retrieves statistical data about patients.

**Purpose:** Generate healthcare analytics and reports.

---

### Search Patients
**GET** `/search`

Searches for patients based on various criteria.

**Query Parameters:**
- `name`: Patient name
- `healthCard`: Health card number
- `phone`: Phone number
- `email`: Email address

**Purpose:** Find patients quickly using various search criteria.

---

### Upload Patient Document
**POST** `/:patientId/documents`

Uploads documents related to the patient.

**Purpose:** Store and manage patient-related documents and files.

---

### Get Patient Documents
**GET** `/:patientId/documents`

Retrieves all documents associated with a patient.

**Purpose:** Access patient documents and files.

---

## Appointment Management Endpoints

### Book Appointment
**POST** `/appointments/book`

Creates a new appointment booking.

**Request Body:**
```json
{
  "userId": "user_id_here",
  "doctorId": "doctor_id_here",
  "date": "2024-02-01",
  "time": "10:00",
  "reason": "Regular checkup"
}
```

**Purpose:** Schedule patient appointments with doctors.

---

### Get All Appointments
**GET** `/appointments`

Retrieves all appointments in the system.

**Purpose:** View all scheduled appointments (typically for admin/doctor use).

---

### Get User Appointments
**GET** `/appointments/user/:userId`

Retrieves appointments for a specific user.

**Purpose:** Display user's appointment history and upcoming appointments.

---

### Get Appointment by ID
**GET** `/appointments/:appointmentId`

Retrieves details of a specific appointment.

**Purpose:** Access detailed appointment information.

---

### Update Appointment
**PUT** `/appointments/:appointmentId`

Updates appointment details (reschedule, change reason, etc.).

**Purpose:** Modify existing appointment details.

---

### Cancel Appointment
**DELETE** `/appointments/:appointmentId`

Cancels an existing appointment.

**Purpose:** Remove appointments from the schedule.

---

## Payment Management Endpoints

### Get Unpaid Bills
**GET** `/payments/unpaid/:patientId`

Retrieves all unpaid bills for a patient.

**Purpose:** Display outstanding payments for patients.

---

### Get Payment History
**GET** `/payments/history/:patientId`

Retrieves complete payment history for a patient.

**Purpose:** Track payment transactions and history.

---

### Process Payment
**POST** `/payments/confirm`

Processes a payment for a bill.

**Request Body:**
```json
{
  "billId": "bill_id_here",
  "paymentMethod": "card|bank|wallet",
  "amount": 150.00,
  "paymentDetails": {
    "cardNumber": "****1234",
    "expiryDate": "12/25"
  }
}
```

**Purpose:** Handle payment processing and confirmation.

---

### Get Payment by ID
**GET** `/payments/:paymentId`

Retrieves details of a specific payment.

**Purpose:** Access individual payment transaction details.

---

### Get Payment Statistics
**GET** `/payments/stats`

Retrieves payment statistics and analytics.

**Purpose:** Generate financial reports and analytics.

---

### Get Payment Summary
**GET** `/payments/summary/:patientId`

Retrieves payment summary for a patient.

**Purpose:** Display payment overview and summary.

---

### Create Payment Intent
**POST** `/payments/create-intent`

Creates a payment intent for processing.

**Purpose:** Initialize payment processing workflow.

---

### Confirm Payment
**POST** `/payments/confirm`

Confirms a payment transaction.

**Purpose:** Finalize payment processing.

---

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

---

## Error Handling

The API uses standard HTTP status codes:

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Access denied
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

---

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Validation**: Joi
- **Authentication**: JWT
- **Payment Processing**: Stripe integration
- **CORS**: Enabled for cross-origin requests

---

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Update environment variables
   ```

3. **Start Server**
   ```bash
   npm start
   ```

4. **API Base URL**
   ```
   http://localhost:5000/api
   ```

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

## License

This project is licensed under the MIT License.