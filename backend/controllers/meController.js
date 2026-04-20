const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { query } = require('../config/db');
const { ok, fail } = require('../utils/response');

function normalizeText(value) {
  return String(value ?? '').normalize('NFC');
}

function firstExistingPath(candidates) {
  for (const filePath of candidates) {
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }

  return null;
}

function resolvePdfFonts() {
  const projectFontsDir = path.join(__dirname, '..', 'public', 'fonts');

  const regular = firstExistingPath([
    path.join(projectFontsDir, 'NotoSans-Regular.ttf'),
    path.join(projectFontsDir, 'DejaVuSans.ttf'),
    path.join(projectFontsDir, 'arial.ttf'),
    path.join('C:', 'Windows', 'Fonts', 'arial.ttf'),
    path.join('/usr/share/fonts/truetype/dejavu', 'DejaVuSans.ttf'),
    path.join('/usr/share/fonts/truetype/noto', 'NotoSans-Regular.ttf'),
  ]);

  const bold = firstExistingPath([
    path.join(projectFontsDir, 'NotoSans-Bold.ttf'),
    path.join(projectFontsDir, 'DejaVuSans-Bold.ttf'),
    path.join(projectFontsDir, 'arialbd.ttf'),
    path.join('C:', 'Windows', 'Fonts', 'arialbd.ttf'),
    path.join('/usr/share/fonts/truetype/dejavu', 'DejaVuSans-Bold.ttf'),
    path.join('/usr/share/fonts/truetype/noto', 'NotoSans-Bold.ttf'),
  ]);

  const italic = firstExistingPath([
    path.join(projectFontsDir, 'NotoSans-Italic.ttf'),
    path.join(projectFontsDir, 'DejaVuSans-Oblique.ttf'),
    path.join(projectFontsDir, 'ariali.ttf'),
    path.join('C:', 'Windows', 'Fonts', 'ariali.ttf'),
    path.join('/usr/share/fonts/truetype/dejavu', 'DejaVuSans-Oblique.ttf'),
    path.join('/usr/share/fonts/truetype/noto', 'NotoSans-Italic.ttf'),
  ]);

  return {
    regular,
    bold: bold || regular,
    italic: italic || regular,
  };
}

function registerPdfFonts(doc) {
  const fonts = resolvePdfFonts();

  if (fonts.regular) {
    doc.registerFont('AppFont-Regular', fonts.regular);
  }

  if (fonts.bold) {
    doc.registerFont('AppFont-Bold', fonts.bold);
  }

  if (fonts.italic) {
    doc.registerFont('AppFont-Italic', fonts.italic);
  }

  return {
    regular: fonts.regular ? 'AppFont-Regular' : 'Helvetica',
    bold: fonts.bold ? 'AppFont-Bold' : 'Helvetica-Bold',
    italic: fonts.italic ? 'AppFont-Italic' : 'Helvetica-Oblique',
  };
}

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

function formatViDate(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleDateString('vi-VN');
}

function drawTableHeader(doc, y, fontNames) {
  const colStt = 50;
  const colTitle = 95;
  const colPoints = 385;
  const colDate = 450;

  doc.font(fontNames.bold).fontSize(11);
  doc.text(normalizeText('STT'), colStt, y, { width: 40 });
  doc.text(normalizeText('Tên hoạt động'), colTitle, y, { width: 270 });
  doc.text(normalizeText('Điểm'), colPoints, y, { width: 55, align: 'right' });
  doc.text(normalizeText('Ngày tham gia'), colDate, y, { width: 95, align: 'right' });
  doc.moveTo(50, y + 16).lineTo(545, y + 16).stroke();

  return {
    colStt,
    colTitle,
    colPoints,
    colDate,
    nextY: y + 22,
  };
}

async function getCertificateUser(userId) {
  try {
    const result = await query(
      `SELECT student_code, full_name
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [userId]
    );

    return result;
  } catch (error) {
    if (error?.code !== '42703') {
      throw error;
    }

    // Backward compatibility for databases that have not added users.full_name yet.
    const fallbackResult = await query(
      `SELECT student_code, NULL::VARCHAR AS full_name
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [userId]
    );

    return fallbackResult;
  }
}

async function getCertificate(req, res) {
  let doc = null;

  try {
    const userResult = await getCertificateUser(req.user.id);

    if (userResult.rowCount === 0) {
      return fail(res, 'User not found', 404);
    }

    const activitiesResult = await query(
      `SELECT
         a.title,
         ph.points,
         att.created_at AS attended_at
       FROM points_history ph
       JOIN LATERAL (
         SELECT at.created_at
         FROM attendances at
         WHERE at.user_id = ph.user_id
           AND at.activity_id = ph.activity_id
           AND at.status = 'approved'
         ORDER BY at.created_at DESC, at.id DESC
         LIMIT 1
       ) att ON true
       JOIN activities a
         ON a.id = ph.activity_id
       WHERE ph.user_id = $1
       ORDER BY att.created_at DESC`,
      [req.user.id]
    );

    const totalPointsResult = await query(
      `SELECT COALESCE(SUM(points), 0) AS total_points
       FROM points_history
       WHERE user_id = $1`,
      [req.user.id]
    );

    const user = userResult.rows[0];
    const activities = activitiesResult.rows;
    const totalPoints = Number(totalPointsResult.rows[0].total_points);
    const studentName = String(user.full_name || '').trim() || user.student_code;

    doc = new PDFDocument({ size: 'A4', margin: 50 });
    const fontNames = registerPdfFonts(doc);

    doc.on('error', (_streamError) => {
      if (!res.headersSent) {
        fail(res, 'Internal server error', 500);
        return;
      }

      if (!res.writableEnded) {
        res.end();
      }
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="certificate.pdf"');

    doc.pipe(res);

    const logoPath = path.join(__dirname, '..', 'public', 'logo.png');
    if (fs.existsSync(logoPath)) {
      try {
        doc.image(logoPath, 50, 45, { width: 48 });
      } catch (_logoError) {
        // Ignore logo rendering issues to keep PDF generation stable.
      }
    }

    doc
      .font(fontNames.bold)
      .fontSize(18)
      .text(normalizeText('CHỨNG NHẬN HOẠT ĐỘNG NGOẠI KHÓA'), 50, 60, {
        width: 495,
        align: 'center',
      });

    doc.moveDown(2);
    doc.font(fontNames.regular).fontSize(12);
    doc.text(normalizeText(`Họ tên: ${studentName}`));
    doc.text(normalizeText(`MSSV: ${user.student_code}`));
    doc.text(normalizeText(`Tổng điểm: ${totalPoints}`));
    doc.moveDown(1);

    if (activities.length === 0) {
      doc
        .font(fontNames.italic)
        .fontSize(12)
        .text(normalizeText('Chưa có hoạt động nào được xác nhận'), 50, doc.y + 6, {
          width: 495,
          align: 'left',
        });
    } else {
      let currentY = doc.y + 4;
      let header = drawTableHeader(doc, currentY, fontNames);
      currentY = header.nextY;

      doc.font(fontNames.regular).fontSize(11);

      activities.forEach((item, index) => {
        if (currentY > doc.page.height - 95) {
          doc.addPage();
          header = drawTableHeader(doc, 50, fontNames);
          currentY = header.nextY;
          doc.font(fontNames.regular).fontSize(11);
        }

        const title = String(item.title || '');
        const points = Number(item.points || 0);
        const attendedAt = formatViDate(item.attended_at);

        doc.text(String(index + 1), header.colStt, currentY, { width: 40 });
        doc.text(normalizeText(title), header.colTitle, currentY, { width: 270 });
        doc.text(String(points), header.colPoints, currentY, {
          width: 55,
          align: 'right',
        });
        doc.text(attendedAt, header.colDate, currentY, {
          width: 95,
          align: 'right',
        });

        currentY += 21;
      });
    }

    const footerY = doc.page.height - 70;
    doc
      .font(fontNames.regular)
      .fontSize(10)
      .text(normalizeText(`Ngày xuất: ${formatViDate(new Date())}`), 50, footerY, { width: 495 });
    doc.text(normalizeText('Hệ thống quản lý hoạt động ngoại khóa'), 50, footerY + 14, { width: 495 });

    doc.end();
  } catch (_error) {
    if (!res.headersSent) {
      return fail(res, 'Internal server error', 500);
    }

    if (doc && !doc.readableEnded) {
      try {
        doc.end();
      } catch (_endError) {
        if (!res.writableEnded) {
          res.end();
        }
      }
      return;
    }

    if (!res.writableEnded) {
      res.end();
    }
  }
}

async function getWeeklyStats(req, res) {
  try {
    const result = await query(
      `SELECT COUNT(DISTINCT activity_id)::int AS activities_count
       FROM attendances
       WHERE user_id = $1
         AND status = 'approved'
         AND created_at >= date_trunc('week', NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh')
         AND created_at < date_trunc('week', NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh') + interval '7 days'`,
      [req.user.id]
    );

    return ok(res, 'Weekly stats fetched', {
      activities_count: result.rows[0]?.activities_count || 0,
    });
  } catch (_error) {
    return fail(res, 'Internal server error', 500);
  }
}

async function getStats(req, res) {
  try {
    const result = await query(
      `SELECT
         a.title,
         ph.points,
         att.attended_at
       FROM points_history ph
       JOIN activities a ON a.id = ph.activity_id
       LEFT JOIN LATERAL (
         SELECT at2.created_at AS attended_at
         FROM attendances at2
         WHERE at2.user_id = ph.user_id
           AND at2.activity_id = ph.activity_id
           AND at2.status = 'approved'
         ORDER BY at2.created_at DESC
         LIMIT 1
       ) att ON true
       WHERE ph.user_id = $1
       ORDER BY ph.points DESC`,
      [req.user.id]
    );

    return ok(res, 'Stats fetched', { activities: result.rows });
  } catch (_error) {
    return fail(res, 'Internal server error', 500);
  }
}

module.exports = {
  getPoints,
  getActivities,
  getCertificate,
  getWeeklyStats,
  getStats,
};
