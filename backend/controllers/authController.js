const { query } = require('../config/db');
const { signAccessToken } = require('../config/jwt');
const { ok, fail } = require('../utils/response');

async function register(req, res) {
  try {
    const studentCode = String(req.body.student_code || '').trim();
    const password = String(req.body.password || '');

    if (!studentCode || !password) {
      return fail(res, 'Vui lòng nhập MSSV và mật khẩu', 400);
    }

    if (password.length < 6) {
      return fail(res, 'Mật khẩu phải dài hơn 6 kí tự', 400);
    }

    // Dev-only: keep plaintext to simplify local demo setup.
    const passwordHash = password;

    const result = await query(
      `INSERT INTO users (student_code, password_hash, role)
       VALUES ($1, $2, 'student')
       RETURNING id, student_code, role`,
      [studentCode, passwordHash]
    );

    return ok(res, 'Registered successfully', result.rows[0], 201);
  } catch (error) {
    if (error.code === '23505') {
      return fail(res, 'student_code already exists', 409);
    }

    return fail(res, 'Internal server error', 500);
  }
}

async function login(req, res) {
  try {
    const studentCode = String(req.body.student_code || '').trim();
    const password = String(req.body.password || '');

    if (!studentCode || !password) {
      return fail(res, 'Vui lòng nhập MSSV và mật khẩu', 400);
    }

    const result = await query(
      'SELECT id, student_code, password_hash, role FROM users WHERE student_code = $1',
      [studentCode]
    );

    const user = result.rows[0];
    if (!user) {
      return fail(res, 'Sai tài khoản hoặc mật khẩu', 401);
    }

    const matched = password === user.password_hash;
    if (!matched) {
      return fail(res, 'Sai tài khoản hoặc mật khẩu', 401);
    }

    const token = signAccessToken(user);

    return ok(res, 'Login success', {
      token,
      user: {
        id: user.id,
        student_code: user.student_code,
        role: user.role,
      },
    });
  } catch (_error) {
    return fail(res, 'Internal server error', 500);
  }
}

module.exports = {
  register,
  login,
};
