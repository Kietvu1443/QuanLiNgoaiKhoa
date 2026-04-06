const express = require('express');
const {
  listActivities,
  createActivity,
  registerActivity,
} = require('../controllers/activityController');
const { authRequired, adminOnly } = require('../middlewares/auth');

const router = express.Router();

router.get('/', listActivities);
router.post('/', authRequired, adminOnly, createActivity);
router.post('/:id/register', authRequired, registerActivity);

module.exports = router;
