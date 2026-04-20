const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { ok, fail } = require('../utils/response');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'activities');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

// File filter: allow by extension OR MIME type
const fileFilter = (_req, file, cb) => {
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (allowedExts.includes(ext) || allowedMimes.includes(mime)) {
    cb(null, true);
  } else {
    cb(new Error(`Chỉ chấp nhận file ảnh (.jpg, .png, .webp). File gửi lên: ${ext}, ${mime}`), false);
  }
};

// Multer instance with 5MB limit
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Handler for POST /upload-image
function uploadImage(req, res) {
  if (!req.file) {
    return fail(res, 'Không có file ảnh được gửi lên', 400);
  }

  const imageUrl = `/uploads/activities/${req.file.filename}`;
  return ok(res, 'Upload thành công', { image_url: imageUrl });
}

module.exports = {
  upload,
  uploadImage,
};
