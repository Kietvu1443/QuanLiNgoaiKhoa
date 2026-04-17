const express = require('express');

const authRouter = require('./auth');
const activitiesRouter = require('./activities');
const qrRouter = require('./qr');
const attendanceRouter = require('./attendance');
const adminAttendanceRouter = require('./adminAttendance');
const meRouter = require('./me');

const router = express.Router();

router.get('/health', (_req, res) => {
    res.json({
        success: true,
        message: 'OK',
        data: null,
    });
});

router.use('/auth', authRouter);
router.use('/activities', activitiesRouter);
router.use('/qr', qrRouter);
router.use('/attendance', attendanceRouter);
router.use('/admin/attendance', adminAttendanceRouter);
router.use('/me', meRouter);

module.exports = router;