const { query } = require('../config/db');
const { ok, fail } = require('../utils/response');

async function getPoints(req, res) {
  try {
    const result = await query(
      'SELECT COALESCE(SUM(points), 0) AS total_points FROM points_history WHERE user_id = $1',
      [req.user.id]
    );

    return ok(res, 'Points fetched', {
      total_points: Number(result.rows[0].total_points),
    });
  } catch (_error) {
    return fail(res, 'Internal server error', 500);
  }
}

async function getActivities(req, res) {
  try {
    const result = await query(
      `SELECT
         a.id AS activity_id,
         a.title,
         a.description,
         a.start_time,
         a.end_time,
         COALESCE(at.status, 'not_attended') AS status,
         at.created_at AS attended_at,
         COALESCE(ph.points, 0) AS points
       FROM registrations r
       JOIN activities a ON a.id = r.activity_id
       LEFT JOIN attendances at
         ON at.user_id = r.user_id AND at.activity_id = r.activity_id
       LEFT JOIN LATERAL (
         SELECT COALESCE(SUM(points), 0) AS points
         FROM points_history p
         WHERE p.user_id = r.user_id AND p.activity_id = r.activity_id
       ) ph ON true
       WHERE r.user_id = $1
       ORDER BY a.start_time DESC`,
      [req.user.id]
    );

    return ok(res, 'Registered activities fetched', result.rows);
  } catch (_error) {
    return fail(res, 'Internal server error', 500);
  }
}

module.exports = {
  getPoints,
  getActivities,
};
