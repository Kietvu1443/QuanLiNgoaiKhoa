const { query } = require('../config/db');
const { ok, fail } = require('../utils/response');

async function getAdminStats(_req, res) {
  try {
    const result = await query(
      `SELECT a.id, a.title, COUNT(att.id)::int AS participants_count
       FROM activities a
       LEFT JOIN attendances att
         ON att.activity_id = a.id AND att.status = 'approved'
       GROUP BY a.id, a.title
       ORDER BY participants_count DESC`
    );

    return ok(res, 'Admin stats fetched', { activities: result.rows });
  } catch (_error) {
    return fail(res, 'Internal server error', 500);
  }
}

async function getActivityDetailStats(req, res) {
  try {
    const activityId = Number(req.params.id);
    if (!Number.isInteger(activityId)) {
      return fail(res, 'Invalid activity id', 400);
    }

    const result = await query(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'approved')::int AS approved,
         COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
         COUNT(*) FILTER (WHERE status = 'rejected')::int AS rejected
       FROM attendances
       WHERE activity_id = $1`,
      [activityId]
    );

    const row = result.rows[0] || { approved: 0, pending: 0, rejected: 0 };
    return ok(res, 'Activity detail stats fetched', row);
  } catch (_error) {
    return fail(res, 'Internal server error', 500);
  }
}

module.exports = {
  getAdminStats,
  getActivityDetailStats,
};
