const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
});

const medicalHistorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const medicalRecordSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  diagnosis: {
    type: String,
    required: true
  },
  treatment: {
    type: String,
    required: true
  },
  prescription: {
    type: String
  },
  notes: {
    type: String
  },
  medicalHistory: [medicalHistorySchema],
  attachments: [attachmentSchema]
}, {
  timestamps: true
});

// Middleware để populate thông tin bệnh nhân và bác sĩ
medicalRecordSchema.pre('find', function() {
  this.populate('patient', 'fullName')
    .populate('doctor', 'fullName')
    .populate({
      path: 'appointment',
      select: 'appointmentDate timeSlot reason'
    })
});

medicalRecordSchema.pre('findOne', function() {
  this.populate('patient', 'fullName')
    .populate('doctor', 'fullName')
    .populate({
      path: 'appointment',
      select: 'appointmentDate timeSlot reason'
    })
});

// Virtual field cho tên bệnh nhân và bác sĩ
medicalRecordSchema.virtual('patientName').get(function() {
  return this.patient ? this.patient.fullName : '';
});

medicalRecordSchema.virtual('doctorName').get(function() {
  return this.doctor ? this.doctor.fullName : '';
});

// Đảm bảo virtuals được bao gồm khi chuyển đổi sang JSON
medicalRecordSchema.set('toJSON', { virtuals: true });
medicalRecordSchema.set('toObject', { virtuals: true });

// Indexes for frequent queries
medicalRecordSchema.index({ patient: 1, createdAt: -1 });
medicalRecordSchema.index({ doctor: 1, createdAt: -1 });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema); 