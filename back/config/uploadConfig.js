const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const crypto = require('crypto');

// Create uploads directory if it doesn't exist
const uploadsDir = path.resolve(__dirname, '..', 'uploads');
fs.ensureDirSync(uploadsDir);

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const ticketId = req.params.ticketId;
    const ticketDir = path.join(uploadsDir, `ticket-${ticketId}`);
    
    // Create directory for this ticket if it doesn't exist
    fs.ensureDirSync(ticketDir);
    cb(null, ticketDir);
  },
  filename: (req, file, cb) => {
    // Create a unique filename to prevent collisions
    const uniqueSuffix = crypto.randomBytes(8).toString('hex');
    const fileExt = path.extname(file.originalname);
    cb(null, `${Date.now()}-${uniqueSuffix}${fileExt}`);
  }
});

// File filter to limit upload types if needed
const fileFilter = (req, file, cb) => {
  // Accept all files for now, add restrictions if needed
  cb(null, true);
};

// Create the multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
  }
});

module.exports = upload;