const { query } = require('../config/db');
const { signAccessToken } = require('../config/jwt');
const { ok, fail } = require('../utils/response');

async function register(req, res) {
  try {
    const fullName = String(req.body.full_name || '').trim();
    const studentCode = String(req.body.student_code || '').trim();
    const password = String(req.body.password || '');

    if (!fullName || !studentCode || !password) {
      return fail(res, 'Vui lòng nhập họ tên, MSSV và mật khẩu', 400);
    }

    if (password.length < 6) {
      return fail(res, 'Mật khẩu phải dài hơn 6 kí tự', 400);
    }

    // Dev-only: keep plaintext to simplify local demo setup.
    const passwordHash = password;

    let result;
    try {
      result = await query(
        `INSERT INTO users (student_code, full_name, password_hash, role)
         VALUES ($1, $2, $3, 'student')
         RETURNING id, student_code, full_name, role`,
        [studentCode, fullName, passwordHash]
      );
    } catch (error) {
      if (error?.code !== '42703') {
        throw error;
      }

      result = await query(
        `INSERT INTO users (student_code, password_hash, role)
         VALUES ($1, $2, 'student')
         RETURNING id, student_code, NULL::VARCHAR AS full_name, role`,
        [studentCode, passwordHash]
      );
    }

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

    let result;
    try {
      result = await query(
        'SELECT id, student_code, full_name, password_hash, role FROM users WHERE student_code = $1',
        [studentCode]
      );
    } catch (error) {
      if (error?.code !== '42703') {
        throw error;
      }

      result = await query(
        'SELECT id, student_code, NULL::VARCHAR AS full_name, password_hash, role FROM users WHERE student_code = $1',
        [studentCode]
      );
    }

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
        full_name: user.full_name,
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
