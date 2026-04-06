const express = require('express');
const { scanAttendance } = require('../controllers/attendanceController');
const { authRequired } = require('../middlewares/auth');

const router = express.Router();

router.post('/scan', authRequired, scanAttendance);

module.exports = router;
