const express = require('express');
const { generateQr } = require('../controllers/qrController');
const { authRequired, adminOnly } = require('../middlewares/auth');

const router = express.Router();

router.post('/generate', authRequired, adminOnly, generateQr);

module.exports = router;
