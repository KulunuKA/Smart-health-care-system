import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  // Basic identification
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  reportType: {
    type: String,
    required: true,
    enum: [
      'patient_summary',
      'appointment_summary', 
      'financial_summary',
      'doctor_performance',
      'medical_trends',
      'system_usage',
      'custom'
    ]
  },

  // Report content
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },

  // Report parameters
  parameters: {
    dateRange: {
      startDate: Date,
      endDate: Date
    },
    filters: {
      doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      status: String,
      department: String,
      ageRange: {
        min: Number,
        max: Number
      },
      gender: String
    },
    groupBy: {
      type: String,
      enum: ['day', 'week', 'month', 'year', 'doctor', 'department']
    },
    sortBy: {
      field: String,
      order: {
        type: String,
        enum: ['asc', 'desc'],
        default: 'desc'
      }
    }
  },

  // Report format and export options
  format: {
    type: String,
    enum: ['json', 'pdf', 'excel', 'csv'],
    default: 'json'
  },
  exportPath: {
    type: String,
    trim: true
  },
  fileSize: {
    type: Number
  },

  // Report status and scheduling
  status: {
    type: String,
    enum: ['pending', 'generating', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  scheduledAt: {
    type: Date
  },
  generatedAt: {
    type: Date
  },
  expiresAt: {
    type: Date
  },

  // Access control
  accessLevel: {
    type: String,
    enum: ['public', 'private', 'restricted'],
    default: 'private'
  },
  allowedRoles: [{
    type: String,
    enum: ['Admin', 'Doctor', 'Patient']
  }],
  allowedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // Report metadata
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    trim: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },

  // Audit trail
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  version: {
    type: Number,
    default: 1
  },

  // Report statistics
  statistics: {
    views: {
      type: Number,
      default: 0
    },
    downloads: {
      type: Number,
      default: 0
    },
    lastViewed: Date,
    lastDownloaded: Date
  },

  // Template information (for recurring reports)
  isTemplate: {
    type: Boolean,
    default: false
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report'
  },
  recurrence: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'],
    default: 'none'
  },
  nextGeneration: Date,

  // Additional metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for better performance
reportSchema.index({ title: 'text', description: 'text' });
reportSchema.index({ reportType: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ createdBy: 1 });
reportSchema.index({ 'parameters.dateRange.startDate': 1, 'parameters.dateRange.endDate': 1 });
reportSchema.index({ scheduledAt: 1 });
reportSchema.index({ expiresAt: 1 });
reportSchema.index({ tags: 1 });
reportSchema.index({ category: 1 });
reportSchema.index({ isTemplate: 1 });

// Virtual for report age
reportSchema.virtual('age').get(function() {
  if (this.generatedAt) {
    return Math.floor((Date.now() - this.generatedAt.getTime()) / (1000 * 60 * 60 * 24));
  }
  return Math.floor((Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24));
});

// Virtual for is expired
reportSchema.virtual('isExpired').get(function() {
  if (this.expiresAt) {
    return Date.now() > this.expiresAt.getTime();
  }
  return false;
});

// Virtual for can be accessed by user
reportSchema.methods.canAccess = function(user) {
  // Check if user has required role
  if (this.allowedRoles && this.allowedRoles.length > 0) {
    if (!this.allowedRoles.includes(user.role)) {
      return false;
    }
  }

  // Check if user is in allowed users list
  if (this.allowedUsers && this.allowedUsers.length > 0) {
    if (!this.allowedUsers.some(id => id.toString() === user._id.toString())) {
      return false;
    }
  }

  // Check if report is expired
  if (this.isExpired) {
    return false;
  }

  return true;
};

// Pre-save middleware to set expiration date if not provided
reportSchema.pre('save', function(next) {
  if (!this.expiresAt && this.status === 'completed') {
    // Set expiration to 30 days from generation
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  next();
});

// Ensure virtual fields are serialized
reportSchema.set('toJSON', { virtuals: true });

const Report = mongoose.model('Report', reportSchema);

export { Report as ReportModel };
