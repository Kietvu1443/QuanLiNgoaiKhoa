const { query } = require('../config/db');
const { ok, fail } = require('../utils/response');

async function listActivities(_req, res) {
  try {
    const result = await query(
      `SELECT id, title, description, latitude, longitude, start_time, end_time, points
       FROM activities
       ORDER BY start_time ASC`
    );

    return ok(res, 'Activities fetched', result.rows);
  } catch (_error) {
    return fail(res, 'Internal server error', 500);
  }
}

async function createActivity(req, res) {
  try {
    const {
      title,
      description,
      latitude,
      longitude,
      start_time: startTime,
      end_time: endTime,
      points,
    } = req.body;

    if (!title || latitude === undefined || longitude === undefined || !startTime || !endTime) {
      return fail(res, 'Missing required activity fields', 400);
    }

    const lat = Number(latitude);
    const lng = Number(longitude);
    const activityPoints = Number(points || 0);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return fail(res, 'Invalid latitude or longitude', 400);
    }

    const result = await query(
      `INSERT INTO activities
       (title, description, latitude, longitude, start_time, end_time, points, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, title, description, latitude, longitude, start_time, end_time, points`,
      [title, description || '', lat, lng, startTime, endTime, activityPoints, req.user.id]
    );

    return ok(res, 'Activity created', result.rows[0], 201);
  } catch (_error) {
    return fail(res, 'Internal server error', 500);
  }
}

async function registerActivity(req, res) {
  try {
    const activityId = Number(req.params.id);

    if (!Number.isInteger(activityId)) {
      return fail(res, 'Invalid activity id', 400);
    }

    const activity = await query('SELECT id FROM activities WHERE id = $1', [activityId]);
    if (activity.rowCount === 0) {
      return fail(res, 'Activity not found', 404);
    }

    await query(
      'INSERT INTO registrations (user_id, activity_id) VALUES ($1, $2)',
      [req.user.id, activityId]
    );

    return ok(res, 'Registered activity', { activity_id: activityId }, 201);
  } catch (error) {
    if (error.code === '23505') {
      return fail(res, 'You already registered this activity', 409);
    }

    return fail(res, 'Internal server error', 500);
  }
}

module.exports = {
  listActivities,
  createActivity,
  registerActivity,
};
