const express = require('express');
const { createQr, generateQr, scanQr } = require('../controllers/qrController');
const { authRequired, adminOnly } = require('../middlewares/auth');

const router = express.Router();

router.post('/create', authRequired, adminOnly, createQr);
router.post('/generate', authRequired, adminOnly, generateQr);
router.post('/scan', authRequired, scanQr);

module.exports = router;
