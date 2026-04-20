const { query } = require('../config/db');
const { ok, fail } = require('../utils/response');

async function listActivities(_req, res) {
  try {
    const result = await query(
      `SELECT id, title, description, latitude, longitude, location_text, category, image_url, start_time, end_time, points
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
      location_text,
      category,
      image_url,
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
       (title, description, latitude, longitude, location_text, category, image_url, start_time, end_time, points, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id, title, description, latitude, longitude, location_text, category, image_url, start_time, end_time, points`,
      [title, description || '', lat, lng, (location_text && location_text.trim()) || 'Chưa cập nhật', category || 'Tất cả', image_url || '', startTime, endTime, activityPoints, req.user.id]
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

    const insertResult = await query(
      `INSERT INTO registrations (user_id, activity_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, activity_id) DO NOTHING
       RETURNING user_id`,
      [req.user.id, activityId]
    );

    if (insertResult.rowCount === 0) {
      return ok(res, 'Already registered this activity', {
        activity_id: activityId,
        already_registered: true,
      });
    }

    return ok(res, 'Registered activity', {
      activity_id: activityId,
      already_registered: false,
    }, 201);
  } catch (error) {
    return fail(res, 'Internal server error', 500);
  }
}

async function getCategories(_req, res) {
  try {
    const result = await query(
      `SELECT DISTINCT category FROM activities
       WHERE category IS NOT NULL AND category != ''
       ORDER BY category ASC`
    );

    const categories = result.rows.map((row) => row.category);
    return ok(res, 'Categories fetched', categories);
  } catch (_error) {
    return fail(res, 'Internal server error', 500);
  }
}

module.exports = {
  listActivities,
  createActivity,
  registerActivity,
  getCategories,
};
