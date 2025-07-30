const express = require('express');
const router = express.Router();
const {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getDoctorAvailability,
  updateAppointmentStatus,
  getAppointmentsByDateRange
} = require('../controllers/appointmentController');

// Routes for appointments
router.get('/', getAppointments);
router.post('/', createAppointment);
router.get('/availability', getDoctorAvailability); // Check availability
router.get('/by-date', getAppointmentsByDateRange); // Get by date range
router.get('/:id', getAppointmentById);
router.put('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);
router.patch('/:id/status', updateAppointmentStatus); // Update status

module.exports = router; 