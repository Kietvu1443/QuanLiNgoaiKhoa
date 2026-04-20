const express = require('express');
const { getPoints, getActivities, getCertificate, getWeeklyStats, getStats } = require('../controllers/meController');
const { authRequired } = require('../middlewares/auth');

const router = express.Router();

router.get('/points', authRequired, getPoints);
router.get('/activities', authRequired, getActivities);
router.get('/certificate', authRequired, getCertificate);
router.get('/weekly-stats', authRequired, getWeeklyStats);
router.get('/stats', authRequired, getStats);

module.exports = router;
