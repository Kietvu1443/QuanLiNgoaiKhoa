const express = require('express');
const { getAdminStats, getActivityDetailStats } = require('../controllers/adminStatsController');
const { authRequired, adminOnly } = require('../middlewares/auth');

const router = express.Router();

router.use(authRequired, adminOnly);
router.get('/', getAdminStats);
router.get('/activities/:id/stats', getActivityDetailStats);

module.exports = router;
