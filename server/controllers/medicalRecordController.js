const MedicalRecord = require('../models/MedicalRecord');
const path = require('path');
const fs = require('fs').promises;
const multer = require('multer');

// Cấu hình multer cho việc upload file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/medical-records';
    // Tạo thư mục nếu chưa tồn tại
    fs.mkdir(uploadDir, { recursive: true })
      .then(() => cb(null, uploadDir))
      .catch(err => cb(err));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// @desc    Get all medical records
// @route   GET /api/medical-records
// @access  Private
exports.getMedicalRecords = async (req, res) => {
  try {
    const { patient, doctor, startDate, endDate } = req.query;
    const query = {};

    if (patient) query.patient = patient;
    if (doctor) query.doctor = doctor;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const records = await MedicalRecord.find(query)
      .populate('patient', 'fullName')
      .populate('doctor', 'fullName')
      .sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single medical record
// @route   GET /api/medical-records/:id
// @access  Private
exports.getMedicalRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ bệnh án' });
    }
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create medical record
// @route   POST /api/medical-records
// @access  Private
exports.createMedicalRecord = async (req, res) => {
  try {
    const record = new MedicalRecord(req.body);
    const savedRecord = await record.save();
    res.status(201).json(savedRecord);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update medical record
// @route   PUT /api/medical-records/:id
// @access  Private
exports.updateMedicalRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ bệnh án' });
    }

    Object.assign(record, req.body);
    const updatedRecord = await record.save();
    res.json(updatedRecord);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete medical record
// @route   DELETE /api/medical-records/:id
// @access  Private/Admin
exports.deleteMedicalRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ bệnh án' });
    }

    // Xóa các file đính kèm
    if (record.attachments && record.attachments.length > 0) {
      for (const attachment of record.attachments) {
        try {
          await fs.unlink(attachment.path);
        } catch (error) {
          if (error.code === 'ENOENT') {
            console.warn(`File not found, skip deleting: ${attachment.path}`);
          } else {
            console.error(`Error deleting file ${attachment.path}:`, error);
          }
        }
      }
    }

    await MedicalRecord.deleteOne({ _id: record._id });
    res.json({ message: 'Đã xóa hồ sơ bệnh án' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get patient's medical history
// @route   GET /api/medical-records/patient/:patientId
// @access  Private
exports.getPatientMedicalHistory = async (req, res) => {
  try {
    const medicalRecords = await MedicalRecord.find({ patientId: req.params.patientId })
      .populate('patientId', 'fullName patientId')
      .populate('doctorId', 'fullName specialization')
      .populate('appointmentId')
      .sort({ createdAt: -1 });

    res.json(medicalRecords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add attachment to medical record
// @route   PUT /api/medical-records/:id/attachments
// @access  Private
exports.addAttachment = async (req, res) => {
  try {
    const medicalRecord = await MedicalRecord.findById(req.params.id);
    if (!medicalRecord) {
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ bệnh án' });
    }

    const attachment = {
      name: req.body.name,
      fileUrl: req.body.fileUrl,
      fileType: req.body.fileType,
      uploadDate: new Date(),
    };

    medicalRecord.attachments.push(attachment);
    await medicalRecord.save();

    res.json(medicalRecord);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Upload file đính kèm
exports.uploadAttachment = [
  upload.single('file'),
  async (req, res) => {
    try {
      const record = await MedicalRecord.findById(req.params.id);
      if (!record) {
        return res.status(404).json({ message: 'Không tìm thấy hồ sơ bệnh án' });
      }

      const attachment = {
        name: req.file.originalname,
        path: req.file.path,
        uploadDate: new Date()
      };

      record.attachments.push(attachment);
      await record.save();

      res.status(201).json(attachment);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
];

// Download file đính kèm
exports.downloadAttachment = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ bệnh án' });
    }

    const attachment = record.attachments.id(req.params.attachmentId);
    if (!attachment) {
      return res.status(404).json({ message: 'Không tìm thấy file đính kèm' });
    }

    res.download(attachment.path, attachment.name);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Thêm lịch sử bệnh án
exports.addMedicalHistory = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ bệnh án' });
    }

    record.medicalHistory.push(req.body);
    const updatedRecord = await record.save();
    res.status(201).json(updatedRecord);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete attachment from medical record
// @route   DELETE /api/medical-records/:id/attachments/:attachmentId
// @access  Private
exports.deleteAttachment = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ bệnh án' });
    }
    const attachment = record.attachments.id(req.params.attachmentId);
    if (!attachment) {
      return res.status(404).json({ message: 'Không tìm thấy file đính kèm' });
    }
    // Xóa file vật lý nếu có
    if (attachment.path) {
      try {
        await fs.access(attachment.path);
        await fs.unlink(attachment.path);
      } catch (err) {
        // Nếu file không tồn tại thì bỏ qua
        console.error('File not found or cannot delete:', err);
      }
    }
    // Xóa khỏi mảng attachments
    record.attachments.pull({ _id: req.params.attachmentId });
    await record.save();
    res.json({ message: 'Đã xóa file đính kèm' });
  } catch (error) {
    console.error('Delete attachment error:', error);
    res.status(500).json({ message: 'Lỗi khi xóa file đính kèm' });
  }
}; 