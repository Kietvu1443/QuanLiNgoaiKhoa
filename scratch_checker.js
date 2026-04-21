const { pool } = require('./backend/config/db');
pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'activities'").then(r => console.log(r.rows)).catch(console.error).finally(() => pool.end());
