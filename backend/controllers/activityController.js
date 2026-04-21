const { query } = require("../config/db");
const { ok, fail } = require("../utils/response");

async function listActivities(_req, res) {
  try {
    const result = await query(
      `SELECT id, title, description, latitude, longitude, location_text, category, image_url, start_time, end_time, points
       FROM activities
       ORDER BY start_time ASC`,
    );

    return ok(res, "Activities fetched", result.rows);
  } catch (_error) {
    return fail(res, "Internal server error", 500);
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

    if (
      !title ||
      latitude === undefined ||
      longitude === undefined ||
      !startTime ||
      !endTime
    ) {
      return fail(res, "Missing required activity fields", 400);
    }

    const lat = Number(latitude);
    const lng = Number(longitude);
    const activityPoints = Number(points || 0);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return fail(res, "Invalid latitude or longitude", 400);
    }

    const sTime = new Date(startTime);
    const eTime = new Date(endTime);
    const now = new Date();

    if (sTime >= eTime) {
      return fail(res, "Thời gian bắt đầu phải trước thời gian kết thúc", 400);
    }

    if (eTime <= now) {
      return fail(res, "Thời gian kết thúc phải ở tương lai", 400);
    }

    if (activityPoints < 0) {
      return fail(res, "Điểm không hợp lệ", 400);
    }

    const result = await query(
      `INSERT INTO activities
       (title, description, latitude, longitude, location_text, category, image_url, start_time, end_time, points, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id, title, description, latitude, longitude, location_text, category, image_url, start_time, end_time, points`,
      [
        title,
        description || "",
        lat,
        lng,
        (location_text && location_text.trim()) || "Chưa cập nhật",
        category || "Tất cả",
        image_url || "",
        startTime,
        endTime,
        activityPoints,
        req.user.id,
      ],
    );

    return ok(res, "Activity created", result.rows[0], 201);
  } catch (_error) {
    return fail(res, "Internal server error", 500);
  }
}

async function registerActivity(req, res) {
  try {
    const activityId = Number(req.params.id);

    if (!Number.isInteger(activityId)) {
      return fail(res, "Invalid activity id", 400);
    }

    const activityResult = await query("SELECT * FROM activities WHERE id = $1", [
      activityId,
    ]);
    if (activityResult.rowCount === 0) {
      return fail(res, "Hoạt động không tồn tại", 404);
    }

    const activity = activityResult.rows[0];
    const now = new Date();

    if (new Date(activity.end_time) < now) {
      return fail(res, "Hoạt động đã hết hạn", 400);
    }

    if (new Date(activity.start_time) > now) {
      return fail(res, "Hoạt động chưa bắt đầu", 400);
    }

    // Check attendance status
    const attendanceCheck = await query(
      "SELECT status FROM attendances WHERE user_id = $1 AND activity_id = $2",
      [req.user.id, activityId]
    );

    if (attendanceCheck.rowCount > 0 && attendanceCheck.rows[0].status === 'approved') {
      return fail(res, "Bạn đã hoàn thành hoạt động này", 400);
    }

    // Check registrations
    const regCheck = await query(
      "SELECT 1 FROM registrations WHERE user_id = $1 AND activity_id = $2",
      [req.user.id, activityId]
    );
    if (regCheck.rowCount > 0 || attendanceCheck.rowCount > 0) {
      return fail(res, "Bạn đã đăng ký hoạt động này", 400);
    }

    // Check capacity if max_participants exists
    if (activity.max_participants !== undefined && activity.max_participants !== null) {
      const regCount = await query(
        "SELECT COUNT(*) as count FROM registrations WHERE activity_id = $1",
        [activityId]
      );
      if (Number(regCount.rows[0].count) >= activity.max_participants) {
        return fail(res, "Hoạt động đã đủ số lượng", 400);
      }
    }

    const insertResult = await query(
      `INSERT INTO registrations (user_id, activity_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, activity_id) DO NOTHING
       RETURNING user_id`,
      [req.user.id, activityId],
    );

    if (insertResult.rowCount === 0) {
      return fail(res, "Bạn đã đăng ký hoạt động này", 400);
    }

    return ok(
      res,
      "Registered activity",
      {
        activity_id: activityId,
        already_registered: false,
      },
      201,
    );
  } catch (error) {
    return fail(res, "Internal server error", 500);
  }
}

async function getCategories(_req, res) {
  try {
    const result = await query(
      `SELECT DISTINCT category FROM activities
       WHERE category IS NOT NULL AND category != ''
       ORDER BY category ASC`,
    );

    const categories = result.rows.map((row) => row.category);
    return ok(res, "Categories fetched", categories);
  } catch (_error) {
    return fail(res, "Internal server error", 500);
  }
}

module.exports = {
  listActivities,
  createActivity,
  registerActivity,
  getCategories,
};
