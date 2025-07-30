const express = require('express');
const router = express.Router();
const {
  getDoctors,
  getDoctor,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  updateDoctorSchedule,
  getDoctorAppointments,
  loginDoctor,
  changeDoctorPassword
} = require('../controllers/doctorController');
const multer = require('multer');
const path = require('path');

// Multer config for avatar
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/avatars'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + ext);
  }
});
const upload = multer({ storage });

// Get all doctors
router.get('/', getDoctors);

// Get single doctor
router.get('/:id', getDoctor);

// Create new doctor
router.post('/', createDoctor);

// Update doctor
router.put('/:id', updateDoctor);

// Delete doctor
router.delete('/:id', deleteDoctor);

// Update doctor schedule
router.put('/:id/schedule', updateDoctorSchedule);

// Get doctor appointments
router.get('/:id/appointments', getDoctorAppointments);

// Upload avatar
router.post('/:id/avatar', upload.single('avatar'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  // Update doctor avatar field
  const Doctor = require('../models/Doctor');
  const doctor = await Doctor.findByIdAndUpdate(
    req.params.id,
    { avatar: `/api/doctors/avatar/${req.file.filename}` },
    { new: true }
  );
  if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
  res.json({ avatar: doctor.avatar, doctor });
});

// Serve avatar files
router.get('/avatar/:filename', (req, res) => {
  const filePath = path.join(__dirname, '../uploads/avatars', req.params.filename);
  res.sendFile(filePath);
});

// Đăng nhập bác sĩ
router.post('/login', loginDoctor);

// Đổi mật khẩu bác sĩ
router.post('/:id/change-password', changeDoctorPassword);

module.exports = router; 