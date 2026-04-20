const express = require('express');
const {
  listActivities,
  createActivity,
  registerActivity,
  getCategories,
} = require('../controllers/activityController');
const { upload, uploadImage } = require('../controllers/uploadController');
const { authRequired, adminOnly } = require('../middlewares/auth');

const router = express.Router();

router.get('/', listActivities);
router.get('/categories', getCategories);
router.post('/', authRequired, adminOnly, createActivity);
router.post('/:id/register', authRequired, registerActivity);

// Separate image upload endpoint (decoupled from activity creation)
router.post('/upload-image', authRequired, adminOnly, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      const msg = err.code === 'LIMIT_FILE_SIZE'
        ? 'File quá lớn (tối đa 5MB)'
        : err.message || 'Upload thất bại';
      return res.status(400).json({ success: false, message: msg, data: null });
    }
    return uploadImage(req, res, next);
  });
});

module.exports = router;
