CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP TABLE IF EXISTS points_history CASCADE;
DROP TABLE IF EXISTS attendances CASCADE;
DROP TABLE IF EXISTS qr_tokens CASCADE;
DROP TABLE IF EXISTS registrations CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  student_code VARCHAR(30) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE activities (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  points INT NOT NULL DEFAULT 0 CHECK (points >= 0),
  location_text VARCHAR(255) DEFAULT '',
  category VARCHAR(100) DEFAULT 'Tất cả',
  image_url TEXT DEFAULT '',
  created_by INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE registrations (
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_id INT NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, activity_id)
);

CREATE TABLE qr_tokens (
  id SERIAL PRIMARY KEY,
  activity_id INT NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  token VARCHAR(128) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE attendances (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_id INT NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('approved', 'pending', 'rejected')),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, activity_id)
);

CREATE TABLE points_history (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_id INT NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  points INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, activity_id)
);

CREATE INDEX idx_qr_tokens_token ON qr_tokens(token);
CREATE INDEX idx_qr_tokens_expires ON qr_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_attendances_user ON attendances(user_id);
CREATE INDEX IF NOT EXISTS idx_att_user_activity_status ON attendances(user_id, activity_id, status);
CREATE INDEX IF NOT EXISTS idx_ph_user ON points_history(user_id);
