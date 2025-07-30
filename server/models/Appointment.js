const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: String,
      required: [true, 'Mã lịch hẹn là bắt buộc'],
      unique: true,
      trim: true
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Vui lòng chọn bác sĩ']
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Vui lòng chọn bệnh nhân']
    },
    appointmentDate: {
      type: Date,
      required: [true, 'Vui lòng chọn ngày khám']
    },
    timeSlot: {
      startTime: {
        type: String,
        required: [true, 'Vui lòng chọn giờ bắt đầu']
      },
      endTime: {
        type: String,
        required: [true, 'Vui lòng chọn giờ kết thúc']
      }
    },
    reason: {
      type: String,
      required: [true, 'Vui lòng nhập lý do khám']
    },
    status: {
      type: String,
      enum: ['Đã đặt lịch', 'Đã xác nhận', 'Đã hoàn thành', 'Đã hủy'],
      default: 'Đã đặt lịch'
    },
    statusHistory: [{
      status: {
        type: String,
        required: true
      },
      timestamp: {
        type: Date,
        required: true
      },
      note: String
    }],
    medicalRecord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicalRecord'
    },
    notes: String,
    cancelReason: String,
  },
  {
    timestamps: true,
  }
);

// Create index for searching appointments
appointmentSchema.index({ doctor: 1, appointmentDate: 1 });
appointmentSchema.index({ patient: 1, appointmentDate: 1 });
appointmentSchema.index({ status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema); 