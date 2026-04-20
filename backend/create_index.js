const { Client } = require('pg');
const client = new Client({ connectionString: 'postgres://postgres@localhost:5432/quanly_hoatdong' });
client.connect()
  .then(() => client.query(`CREATE INDEX IF NOT EXISTS idx_attendance_activity_status ON attendances(activity_id, status);`))
  .then(() => { console.log('Index created successfully'); client.end(); })
  .catch((err) => { console.error('Error:', err.message); client.end(); });
