const Patient = require('../models/Patient');

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private
exports.getPatients = async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single patient
// @route   GET /api/patients/:id
// @access  Private
exports.getPatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Không tìm thấy bệnh nhân' });
    }
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create patient
// @route   POST /api/patients
// @access  Private
exports.createPatient = async (req, res) => {
  try {
    // Kiểm tra trùng số điện thoại
    const existed = await Patient.findOne({ phone: req.body.phone });
    if (existed) {
      return res.status(400).json({ message: 'Số điện thoại đã tồn tại!' });
    }
    if (!req.body.patientId) {
      // Lấy tất cả patientId dạng BNxxx, tìm số lớn nhất
      const patients = await Patient.find({ patientId: { $regex: /^BN\d+$/ } }, 'patientId');
      let maxNum = 0;
      patients.forEach(p => {
        const num = parseInt(p.patientId.replace('BN', ''));
        if (!isNaN(num) && num > maxNum) maxNum = num;
      });
      const newId = 'BN' + (maxNum + 1).toString().padStart(3, '0');
      req.body.patientId = newId;
    }
    const patient = new Patient(req.body);
    const savedPatient = await patient.save();
    res.status(201).json(savedPatient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private
exports.updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Không tìm thấy bệnh nhân' });
    }

    const updatedPatient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.json(updatedPatient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete patient
// @route   DELETE /api/patients/:id
// @access  Private
exports.deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Không tìm thấy bệnh nhân' });
    }
    res.json({ message: 'Đã xóa bệnh nhân' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search patients
// @route   GET /api/patients/search
// @access  Private
exports.searchPatients = async (req, res) => {
  try {
    const { query } = req.query;
    const patients = await Patient.find({
      $or: [
        { fullName: { $regex: query, $options: 'i' } },
        { patientId: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } },
      ],
    });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 