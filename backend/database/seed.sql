INSERT INTO users (student_code, full_name, password_hash, role)
VALUES
  ('admin001', 'Quản trị viên', 'admin123', 'admin'),
  ('sv001', 'Sinh viên mẫu', '123456', 'student');

INSERT INTO activities (title, description, latitude, longitude, start_time, end_time, points, created_by)
VALUES
  (
    'AI Workshop',
    'Introduction to AI for students',
    10.762622,
    106.660172,
    NOW() + INTERVAL '1 day',
    NOW() + INTERVAL '1 day 2 hours',
    10,
    1
  ),
  (
    'Volunteer Day',
    'Community service activity',
    10.776530,
    106.700981,
    NOW() + INTERVAL '2 days',
    NOW() + INTERVAL '2 days 3 hours',
    15,
    1
  ),
  (
    'Campus Run',
    'Morning physical activity',
    10.773000,
    106.659000,
    NOW() + INTERVAL '3 days',
    NOW() + INTERVAL '3 days 1 hour',
    8,
    1
  );
