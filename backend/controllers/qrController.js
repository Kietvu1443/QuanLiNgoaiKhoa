const crypto = require("crypto");
const { query } = require("../config/db");
const { ok, fail } = require("../utils/response");

async function generateQr(req, res) {
  try {
    const activityId = Number(req.body.activity_id);
    const durationMinutes = Number(req.body.duration_minutes || 5);

    if (!Number.isInteger(activityId)) {
      return fail(res, "activity_id is required", 400);
    }

    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
      return fail(res, "duration_minutes must be > 0", 400);
    }

    const activity = await query("SELECT id FROM activities WHERE id = $1", [
      activityId,
    ]);
    if (activity.rowCount === 0) {
      return fail(res, "Activity not found", 404);
    }

    const token = crypto.randomBytes(24).toString("hex");

    const result = await query(
      `INSERT INTO qr_tokens (activity_id, token, expires_at)
       VALUES ($1, $2, NOW() + ($3 || ' minutes')::interval)
       RETURNING id, activity_id, token, expires_at`,
      [activityId, token, durationMinutes],
    );

    return ok(res, "QR token generated", result.rows[0], 201);
  } catch (_error) {
    return fail(res, "Internal server error", 500);
  }
}

async function scanQr(req, res) {
  try {
    const token = String(req.body.token || "").trim();
    const userId = req.user.id;

    if (!token) {
      return fail(res, "token is required", 400);
    }

    const qrResult = await query("SELECT * FROM qr_tokens WHERE token = $1", [
      token,
    ]);
    if (qrResult.rowCount === 0) {
      return fail(res, "Invalid QR token", 400);
    }

    const qr = qrResult.rows[0];
    if (new Date(qr.expires_at).getTime() < Date.now()) {
      return fail(res, "QR token expired", 400);
    }

    const duplicateResult = await query(
      "SELECT * FROM attendances WHERE user_id = $1 AND activity_id = $2",
      [userId, qr.activity_id],
    );

    if (duplicateResult.rowCount > 0) {
      return fail(res, "Đã điểm danh", 400);
    }

    await query(
      "INSERT INTO attendances (user_id, activity_id, status) VALUES ($1, $2, $3)",
      [userId, qr.activity_id, "approved"],
    );

    return res.json({ message: "Điểm danh thành công" });
  } catch (_error) {
    return fail(res, "Internal server error", 500);
  }
}

module.exports = {
  generateQr,
  scanQr,
};
