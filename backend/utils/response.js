function ok(res, message, data, status = 200) {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
}

function fail(res, message, status = 400, data = null) {
  return res.status(status).json({
    success: false,
    message,
    data,
  });
}

module.exports = {
  ok,
  fail,
};
