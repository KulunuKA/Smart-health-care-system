import { Router } from "express";
import Joi from "joi";
import { PatientController } from "./patientController.js";
import { validateRequest } from "../../middleware/joiValidation.js";

const router = Router();

// Joi validation schemas
const medicalRecordSchema = Joi.object({
  recordType: Joi.string()
    .valid('consultation', 'diagnosis', 'treatment', 'prescription', 'lab_result', 'vital_signs', 'allergy', 'medication', 'surgery', 'other')
    .required()
    .messages({
      'any.required': 'Record type is required',
      'any.only': 'Invalid record type'
    }),
  title: Joi.string()
    .trim()
    .required()
    .messages({
      'any.required': 'Title is required'
    }),
  description: Joi.string()
    .required()
    .messages({
      'any.required': 'Description is required'
    }),
  doctor: Joi.string()
    .required()
    .messages({
      'any.required': 'Doctor is required'
    }),
  diagnosis: Joi.string()
    .trim()
    .optional(),
  symptoms: Joi.array()
    .items(Joi.string().trim())
    .optional(),
  treatment: Joi.string()
    .trim()
    .optional(),
  medications: Joi.array()
    .items(Joi.object({
      name: Joi.string().trim().required(),
      dosage: Joi.string().trim().required(),
      frequency: Joi.string().trim().required(),
      duration: Joi.string().trim().required(),
      instructions: Joi.string().trim().optional()
    }))
    .optional(),
  vitalSigns: Joi.object({
    bloodPressure: Joi.object({
      systolic: Joi.number().min(0).max(300),
      diastolic: Joi.number().min(0).max(200)
    }).optional(),
    heartRate: Joi.number().min(0).max(300).optional(),
    temperature: Joi.number().min(30).max(45).optional(),
    respiratoryRate: Joi.number().min(0).max(60).optional(),
    oxygenSaturation: Joi.number().min(0).max(100).optional(),
    weight: Joi.number().min(0).max(500).optional(),
    height: Joi.number().min(0).max(300).optional(),
    bmi: Joi.number().min(0).max(100).optional()
  }).optional(),
  labResults: Joi.array()
    .items(Joi.object({
      testName: Joi.string().trim().required(),
      result: Joi.string().trim().required(),
      normalRange: Joi.string().trim().optional(),
      unit: Joi.string().trim().optional(),
      status: Joi.string().valid('normal', 'abnormal', 'critical').default('normal')
    }))
    .optional(),
  followUpRequired: Joi.boolean().default(false),
  followUpDate: Joi.date().optional(),
  notes: Joi.string().trim().optional()
});

const allergySchema = Joi.object({
  allergen: Joi.string().trim().required(),
  severity: Joi.string().valid('mild', 'moderate', 'severe').required(),
  reaction: Joi.string().trim().required(),
  notes: Joi.string().trim().optional()
});

const medicationSchema = Joi.object({
  name: Joi.string().trim().required(),
  dosage: Joi.string().trim().required(),
  frequency: Joi.string().trim().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().optional(),
  prescribedBy: Joi.string().required(),
  instructions: Joi.string().trim().optional(),
  isActive: Joi.boolean().default(true)
});

const patientUpdateSchema = Joi.object({
  healthCardNumber: Joi.string().trim().optional(),
  dateOfBirth: Joi.date().optional(),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
  phone: Joi.string().trim().optional(),
  address: Joi.object({
    street: Joi.string().trim().required(),
    city: Joi.string().trim().required(),
    state: Joi.string().trim().required(),
    zipCode: Joi.string().trim().required(),
    country: Joi.string().trim().default('Sri Lanka')
  }).optional(),
  emergencyContact: Joi.object({
    name: Joi.string().trim().required(),
    relationship: Joi.string().trim().required(),
    phone: Joi.string().trim().required(),
    email: Joi.string().email().optional()
  }).optional(),
  insurance: Joi.object({
    provider: Joi.string().trim().optional(),
    policyNumber: Joi.string().trim().optional(),
    groupNumber: Joi.string().trim().optional(),
    expiryDate: Joi.date().optional()
  }).optional(),
  status: Joi.string().valid('active', 'inactive', 'suspended').optional()
});

// Routes

// Get patient by ID
router.get("/:patientId", PatientController.getPatientById);

// Get patient by health card number
router.get("/health-card/:healthCardNumber", PatientController.getPatientByHealthCard);

// Update patient record
router.put("/:patientId", validateRequest(patientUpdateSchema), PatientController.updatePatientRecord);

// Get patient medical history
router.get("/:patientId/history", PatientController.getMedicalHistory);

// Add medical record entry
router.post("/:patientId/records", validateRequest(medicalRecordSchema), PatientController.addMedicalRecord);

// Update medical record entry
router.put("/:patientId/records/:recordId", validateRequest(medicalRecordSchema), PatientController.updateMedicalRecord);

// Delete medical record entry
router.delete("/:patientId/records/:recordId", PatientController.deleteMedicalRecord);

// Get patient allergies
router.get("/:patientId/allergies", PatientController.getPatientAllergies);

// Update patient allergies
router.put("/:patientId/allergies", validateRequest(Joi.array().items(allergySchema)), PatientController.updatePatientAllergies);

// Get patient medications
router.get("/:patientId/medications", PatientController.getPatientMedications);

// Update patient medications
router.put("/:patientId/medications", validateRequest(Joi.array().items(medicationSchema)), PatientController.updatePatientMedications);

// Get patient statistics
router.get("/stats", PatientController.getPatientStats);

// Search patients
router.get("/search", PatientController.searchPatients);

// Upload patient document
router.post("/:patientId/documents", PatientController.uploadPatientDocument);

// Get patient documents
router.get("/:patientId/documents", PatientController.getPatientDocuments);

export { router as patientRoute };
