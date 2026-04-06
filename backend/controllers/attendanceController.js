const { pool } = require('../config/db');
const { haversineMeters } = require('../utils/distance');
const { ok, fail } = require('../utils/response');

function toBoolean(value) {
  if (value === true || value === 'true' || value === 1 || value === '1') return true;
  return false;
}

async function scanAttendance(req, res) {
  const client = await pool.connect();

  try {
    const token = String(req.body.token || '').trim();
    const hasLocation = toBoolean(req.body.has_location);
    const lat = req.body.lat !== undefined ? Number(req.body.lat) : null;
    const lng = req.body.lng !== undefined ? Number(req.body.lng) : null;

    if (!token) {
      return fail(res, 'Yêu cầu token', 400);
    }

    await client.query('BEGIN');

    const qrResult = await client.query(
      `SELECT qt.id, qt.activity_id, qt.expires_at, a.latitude AS activity_lat, a.longitude AS activity_lng, a.points
       FROM qr_tokens qt
       JOIN activities a ON a.id = qt.activity_id
       WHERE qt.token = $1`,
      [token]
    );

    if (qrResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return fail(res, 'Token không hợp lệ', 400);
    }

    const qr = qrResult.rows[0];

    if (new Date(qr.expires_at).getTime() < Date.now()) {
      await client.query('ROLLBACK');
      return fail(res, 'QR token hết hạn', 400);
    }

    const registrationResult = await client.query(
      'SELECT 1 FROM registrations WHERE user_id = $1 AND activity_id = $2',
      [req.user.id, qr.activity_id]
    );

    if (registrationResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return fail(res, 'Bạn chưa đăng kí hoạt động này', 400);
    }

    const attendedResult = await client.query(
      'SELECT 1 FROM attendances WHERE user_id = $1 AND activity_id = $2',
      [req.user.id, qr.activity_id]
    );

    if (attendedResult.rowCount > 0) {
      await client.query('ROLLBACK');
      return fail(res, 'Bạn đã đăng kí hoạt động này rồi', 409);
    }

    let status = 'pending';
    let distanceMeters = null;

    if (hasLocation) {
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        await client.query('ROLLBACK');
        return fail(res, 'lat and lng are required when has_location is true', 400);
      }

      distanceMeters = haversineMeters(lat, lng, Number(qr.activity_lat), Number(qr.activity_lng));

      if (distanceMeters >= 50) {
        await client.query('ROLLBACK');
        return fail(res, 'Quá xa khỏi nơi diễn ra hoạt động', 400, {
          distance_m: Number(distanceMeters.toFixed(2)),
        });
      }

      status = 'approved';
    }

    const attendanceInsert = await client.query(
      `INSERT INTO attendances (user_id, activity_id, status, latitude, longitude)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id, activity_id, status, latitude, longitude, created_at`,
      [req.user.id, qr.activity_id, status, hasLocation ? lat : null, hasLocation ? lng : null]
    );

    await client.query(
      `INSERT INTO points_history (user_id, activity_id, points)
       VALUES ($1, $2, $3)`,
      [req.user.id, qr.activity_id, Number(qr.points)]
    );

    await client.query('COMMIT');

    return ok(res, 'Attendance recorded', {
      attendance: attendanceInsert.rows[0],
      points_added: Number(qr.points),
      distance_m: distanceMeters !== null ? Number(distanceMeters.toFixed(2)) : null,
    });
  } catch (_error) {
    await client.query('ROLLBACK');
    return fail(res, 'Internal server error', 500);
  } finally {
    client.release();
  }
}

module.exports = {
  scanAttendance,
};
