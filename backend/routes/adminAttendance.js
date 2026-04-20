const express = require('express');
const {
  getPendingAttendances,
  approveAttendance,
  rejectAttendance,
} = require('../controllers/attendanceController');
const { authRequired, adminOnly } = require('../middlewares/auth');

const router = express.Router();

router.use(authRequired, adminOnly);
router.get('/pending', getPendingAttendances);
router.patch('/:id/approve', approveAttendance);
router.patch('/:id/reject', rejectAttendance);

module.exports = router;
