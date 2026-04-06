const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'demo-secret-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      student_code: user.student_code,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = {
  signAccessToken,
  verifyAccessToken,
};
