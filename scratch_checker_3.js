const { Client } = require('pg');
const client = new Client({ connectionString: 'postgres://postgres@localhost:5432/quanly_hoatdong' });
client.connect()
.then(() => client.query(`
  SELECT conname
  FROM pg_constraint
  WHERE conrelid = 'points_history'::regclass
    AND contype = 'u'
`))
.then(r => console.log('UNIQUE CONSTRAINTS:', r.rows))
.catch(console.error)
.finally(() => client.end());
