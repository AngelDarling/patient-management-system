const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const bcrypt = require('bcryptjs');

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public
const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single doctor
// @route   GET /api/doctors/:id
// @access  Public
const getDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Không tìm thấy bác sĩ' });
    }
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new doctor
// @route   POST /api/doctors
// @access  Private
const createDoctor = async (req, res) => {
  try {
    // Tự động sinh mã nhân viên nếu không được cung cấp
    if (!req.body.staffId || req.body.staffId.trim() === '') {
      // Tìm mã BS lớn nhất
      const lastDoctor = await Doctor.findOne({ staffId: /^BS/ }).sort({ 'staffId': -1 }).exec();
      let newIdNumber = 1;
      if (lastDoctor && lastDoctor.staffId) {
        const lastIdNum = parseInt(lastDoctor.staffId.replace('BS', ''), 10);
        if (!isNaN(lastIdNum)) {
          newIdNumber = lastIdNum + 1;
        }
      }
      req.body.staffId = 'BS' + newIdNumber.toString().padStart(3, '0');
    }

    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }
    const doctor = new Doctor(req.body);
    const savedDoctor = await doctor.save();
    res.status(201).json(savedDoctor);
  } catch (error) {
    // Bắt lỗi trùng lặp và các lỗi validation khác
    if (error.code === 11000) {
        return res.status(400).json({ message: 'Mã nhân viên hoặc email đã tồn tại.' });
    }
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update doctor
// @route   PUT /api/doctors/:id
// @access  Private
const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Không tìm thấy bác sĩ' });
    }

    // Nếu có trường password và không rỗng, xử lý hash
    if ('password' in req.body && req.body.password) {
      if (!req.body.password.startsWith('$2a$')) {
        req.body.password = await bcrypt.hash(req.body.password, 10);
      }
    } else {
      // Nếu không có trường password trong payload, không update password
      delete req.body.password;
    }
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedDoctor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete doctor
// @route   DELETE /api/doctors/:id
// @access  Private
const deleteDoctor = async (req, res) => {
  try {
    const doctorId = req.params.id;

    // Kiểm tra xem bác sĩ có lịch hẹn nào không
    const appointmentCount = await Appointment.countDocuments({ doctor: doctorId });
    if (appointmentCount > 0) {
      return res.status(400).json({ 
        message: 'Không thể xóa bác sĩ vì vẫn còn lịch hẹn. Vui lòng hủy hoặc hoàn thành các lịch hẹn trước.' 
      });
    }

    // Nếu không có lịch hẹn, tiến hành xóa
    const doctor = await Doctor.findByIdAndDelete(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Không tìm thấy bác sĩ' });
    }

    res.json({ message: 'Đã xóa bác sĩ thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update doctor schedule
// @route   PUT /api/doctors/:id/schedule
// @access  Private
const updateDoctorSchedule = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Không tìm thấy bác sĩ' });
    }

    doctor.schedule = req.body.schedule;
    const updatedDoctor = await doctor.save();
    res.json(updatedDoctor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get doctor appointments
// @route   GET /api/doctors/:id/appointments
// @access  Private
const getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctor: req.params.id })
      .populate('patient', 'fullName')
      .sort({ appointmentDate: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Đăng nhập bác sĩ
const loginDoctor = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu' });
  }
  try {
    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }
    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }
    // Trả về thông tin doctor (bỏ password)
    const { password: pw, ...doctorData } = doctor.toObject();
    res.json(doctorData);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi đăng nhập', error: error.message });
  }
};

// @desc    Change doctor password
// @route   POST /api/doctors/:id/change-password
// @access  Private
const changeDoctorPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Không tìm thấy bác sĩ' });
    }
    // Nếu có oldPassword (bác sĩ tự đổi), kiểm tra như cũ
    if (oldPassword) {
      const isMatch = await bcrypt.compare(oldPassword, doctor.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Mật khẩu cũ không đúng' });
      }
    }
    // Nếu không có oldPassword (admin reset), cho phép đổi luôn
    doctor.password = await bcrypt.hash(newPassword, 10);
    await doctor.save();
    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getDoctors,
  getDoctor,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  updateDoctorSchedule,
  getDoctorAppointments,
  loginDoctor,
  changeDoctorPassword
}; 