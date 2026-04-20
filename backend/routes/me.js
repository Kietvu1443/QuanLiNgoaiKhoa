const express = require('express');
const { getPoints, getActivities, getCertificate } = require('../controllers/meController');
const { authRequired } = require('../middlewares/auth');

const router = express.Router();

router.get('/points', authRequired, getPoints);
router.get('/activities', authRequired, getActivities);
router.get('/certificate', authRequired, getCertificate);

module.exports = router;
