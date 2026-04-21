const express = require('express');
const { generateQr, scanQr } = require('../controllers/qrController');
const { authRequired, adminOnly } = require('../middlewares/auth');

const router = express.Router();

router.post('/generate', authRequired, adminOnly, generateQr);
router.post('/scan', authRequired, scanQr);

module.exports = router;
