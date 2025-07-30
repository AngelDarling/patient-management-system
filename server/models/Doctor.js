const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    staffId: {
      type: String,
      required: [true, 'Vui lòng nhập mã nhân viên'],
      unique: true,
    },
    fullName: {
      type: String,
      required: [true, 'Vui lòng nhập họ tên'],
    },
    specialization: {
      type: String,
      required: [true, 'Vui lòng nhập chuyên khoa'],
    },
    phone: {
      type: String,
      required: [true, 'Vui lòng nhập số điện thoại'],
    },
    email: {
      type: String,
      required: [true, 'Vui lòng nhập email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Vui lòng nhập email hợp lệ'
      ]
    },
    schedule: [{
      dayOfWeek: {
        type: String,
        required: true,
        enum: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'],
      },
      timeSlots: [{
        startTime: {
          type: String,
          required: true,
        },
        endTime: {
          type: String,
          required: true,
        },
      }],
    }],
    qualifications: [{
      degree: String,
      institution: String,
      year: Number,
    }],
    isAvailable: {
      type: Boolean,
      default: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    password: {
      type: String,
      required: [true, 'Vui lòng nhập mật khẩu'],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Doctor', doctorSchema); 