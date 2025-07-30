const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res) => {
  try {
    const filter = {};
    if (req.query.doctor) filter.doctor = req.query.doctor;
    if (req.query.appointmentDate) {
      // Lọc theo ngày (bỏ phần giờ)
      const date = new Date(req.query.appointmentDate);
      filter.appointmentDate = {
        $gte: new Date(date.setHours(0,0,0,0)),
        $lte: new Date(date.setHours(23,59,59,999))
      };
    }
    const appointments = await Appointment.find(filter)
      .populate('doctor', 'fullName specialization')
      .populate('patient', 'fullName')
      .sort({ appointmentDate: -1, 'timeSlot.startTime': 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
const getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('doctor', 'fullName specialization')
      .populate('patient', 'fullName')
      .populate('medicalRecord');
    
    if (!appointment) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('doctor', 'fullName specialization')
      .populate('patient', 'fullName')
      .populate('medicalRecord');
    if (!appointment) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
    }
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private
const createAppointment = async (req, res) => {
  try {
    // Check if doctor exists
    const doctor = await Doctor.findById(req.body.doctor);
    if (!doctor) {
      return res.status(404).json({ message: 'Không tìm thấy bác sĩ' });
    }

    // Tìm bệnh nhân theo phone
    let patient = await Patient.findOne({ phone: req.body.phone });

    // Nếu chưa có thì tạo mới bệnh nhân
    if (!patient) {
      // Tạo patientId tự động như trong patientController
      const patients = await Patient.find({ patientId: { $regex: /^BN\d+$/ } }, 'patientId');
      let maxNum = 0;
      patients.forEach(p => {
        const num = parseInt(p.patientId.replace('BN', ''));
        if (!isNaN(num) && num > maxNum) maxNum = num;
      });
      const newId = 'BN' + (maxNum + 1).toString().padStart(3, '0');
      patient = new Patient({
        patientId: newId,
        fullName: req.body.fullName,
        dateOfBirth: req.body.dateOfBirth,
        gender: req.body.gender || 'Khác',
        address: req.body.address || '',
        phone: req.body.phone,
        email: req.body.email || ''
      });
      await patient.save();
    }

    // Check if the time slot is available
    const existingAppointment = await Appointment.findOne({
      doctor: req.body.doctor,
      appointmentDate: req.body.appointmentDate,
      'timeSlot.startTime': req.body.timeSlot.startTime,
      'timeSlot.endTime': req.body.timeSlot.endTime
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'Khung giờ này đã có lịch hẹn' });
    }

    // Tạo appointmentId tự động
    const appointments = await Appointment.find({ appointmentId: { $regex: /^AP\d+$/ } }, 'appointmentId');
    let maxAppNum = 0;
    appointments.forEach(a => {
      const num = parseInt(a.appointmentId.replace('AP', ''));
      if (!isNaN(num) && num > maxAppNum) maxAppNum = num;
    });
    const newAppId = 'AP' + (maxAppNum + 1).toString().padStart(5, '0');

    // Create appointment with initial status history
    const appointment = new Appointment({
      ...req.body,
      appointmentId: newAppId,
      reason: req.body.symptoms || req.body.reason || '',
      patient: patient._id,
      statusHistory: [{
        status: req.body.status || 'Đã đặt lịch',
        timestamp: new Date(),
        note: 'Tạo lịch hẹn mới'
      }]
    });

    const savedAppointment = await appointment.save();
    
    // Populate doctor and patient names
    const populatedAppointment = await Appointment.findById(savedAppointment._id)
      .populate('doctor', 'fullName specialization')
      .populate('patient', 'fullName');

    res.status(201).json(populatedAppointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
    }

    // If status is changed, add to status history
    if (req.body.status && req.body.status !== appointment.status) {
      appointment.statusHistory.push({
        status: req.body.status,
        timestamp: new Date(),
        note: req.body.statusNote || `Cập nhật trạng thái thành ${req.body.status}`
      });
    }

    // Update appointment
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        statusHistory: appointment.statusHistory
      },
      { new: true }
    )
      .populate('doctor', 'fullName specialization')
      .populate('patient', 'fullName');

    res.json(updatedAppointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private
const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
    }

    res.json({ message: 'Đã xóa lịch hẹn thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get appointments by date range
// @route   GET /api/appointments/range
// @access  Private
const getAppointmentsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const appointments = await Appointment.find({
      appointmentDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    })
      .populate('doctor', 'fullName specialization')
      .populate('patient', 'fullName');
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
    }
    appointment.status = 'Đã hủy';
    appointment.statusHistory.push({
      status: 'Đã hủy',
      timestamp: new Date(),
      note: 'Lịch hẹn đã bị hủy'
    });
    await appointment.save();
    res.json({ cancelled: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check doctor availability for a specific date
// @route   GET /api/appointments/availability
// @access  Public
const getDoctorAvailability = async (req, res) => {
  try {
    // Trả về dữ liệu mẫu, bạn có thể thay đổi logic sau
    res.json({ available: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update appointment status
// @route   PATCH /api/appointments/:id/status
// @access  Private
const updateAppointmentStatus = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
    }
    appointment.status = req.body.status;
    appointment.statusHistory.push({
      status: req.body.status,
      timestamp: new Date(),
      note: req.body.note || ''
    });
    await appointment.save();
    res.json({ updated: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAppointments,
  getAppointment,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getDoctorAvailability,
  getAppointmentsByDateRange,
  cancelAppointment,
  updateAppointmentStatus
}; 