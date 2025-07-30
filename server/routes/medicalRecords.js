const express = require('express');
const router = express.Router();
const {
  getMedicalRecords,
  getMedicalRecord,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
  uploadAttachment,
  downloadAttachment,
  addMedicalHistory
} = require('../controllers/medicalRecordController');

// Các routes cho hồ sơ bệnh án
router.get('/', getMedicalRecords);
router.get('/:id', getMedicalRecord);
router.post('/', createMedicalRecord);
router.put('/:id', updateMedicalRecord);
router.delete('/:id', deleteMedicalRecord);

// Routes cho file đính kèm
router.post('/:id/attachments', uploadAttachment);
router.get('/:id/attachments/:attachmentId', downloadAttachment);
router.delete('/:id/attachments/:attachmentId', require('../controllers/medicalRecordController').deleteAttachment);

// Route cho lịch sử bệnh án
router.post('/:id/history', addMedicalHistory);

module.exports = router; 