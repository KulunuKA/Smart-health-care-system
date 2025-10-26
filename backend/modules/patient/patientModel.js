import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema({
  recordType: {
    type: String,
    required: true,
    enum: ['consultation', 'diagnosis', 'treatment', 'prescription', 'lab_result', 'vital_signs', 'allergy', 'medication', 'surgery', 'other']
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  diagnosis: {
    type: String,
    trim: true
  },
  symptoms: [{
    type: String,
    trim: true
  }],
  treatment: {
    type: String,
    trim: true
  },
  medications: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    dosage: {
      type: String,
      required: true,
      trim: true
    },
    frequency: {
      type: String,
      required: true,
      trim: true
    },
    duration: {
      type: String,
      required: true,
      trim: true
    },
    instructions: {
      type: String,
      trim: true
    }
  }],
  vitalSigns: {
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    heartRate: Number,
    temperature: Number,
    respiratoryRate: Number,
    oxygenSaturation: Number,
    weight: Number,
    height: Number,
    bmi: Number
  },
  labResults: [{
    testName: {
      type: String,
      required: true,
      trim: true
    },
    result: {
      type: String,
      required: true,
      trim: true
    },
    normalRange: {
      type: String,
      trim: true
    },
    unit: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['normal', 'abnormal', 'critical'],
      default: 'normal'
    }
  }],
  attachments: [{
    filename: String,
    originalName: String,
    filePath: String,
    fileType: String,
    fileSize: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: Date,
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  }
}, {
  timestamps: true
});

const patientSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  healthCardNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female', 'other']
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    street: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    zipCode: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      required: true,
      trim: true,
      default: 'Sri Lanka'
    }
  },
  emergencyContact: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    relationship: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true
    }
  },
  medicalHistory: [medicalRecordSchema],
  allergies: [{
    allergen: {
      type: String,
      required: true,
      trim: true
    },
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe'],
      required: true
    },
    reaction: {
      type: String,
      required: true,
      trim: true
    },
    notes: {
      type: String,
      trim: true
    },
    dateRecorded: {
      type: Date,
      default: Date.now
    }
  }],
  currentMedications: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    dosage: {
      type: String,
      required: true,
      trim: true
    },
    frequency: {
      type: String,
      required: true,
      trim: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: Date,
    prescribedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    instructions: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  insurance: {
    provider: {
      type: String,
      trim: true
    },
    policyNumber: {
      type: String,
      trim: true
    },
    groupNumber: {
      type: String,
      trim: true
    },
    expiryDate: Date
  },
  documents: [{
    filename: String,
    originalName: String,
    filePath: String,
    fileType: String,
    fileSize: Number,
    category: {
      type: String,
      enum: ['insurance', 'id', 'medical_report', 'prescription', 'other'],
      default: 'other'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  lastVisit: Date,
  nextAppointment: Date
}, {
  timestamps: true
});

// Indexes for better performance
patientSchema.index({ healthCardNumber: 1 });
patientSchema.index({ user: 1 });
patientSchema.index({ 'medicalHistory.date': -1 });
patientSchema.index({ status: 1 });

// Virtual for age calculation
patientSchema.virtual('age').get(function() {
  if (this.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
  return null;
});

// Ensure virtual fields are serialized
patientSchema.set('toJSON', { virtuals: true });

const Patient = mongoose.model('Patient', patientSchema);

export { Patient as PatientModel };
