const { Client } = require('pg');
const client = new Client({ connectionString: 'postgres://postgres@localhost:5432/quanly_hoatdong' });
client.connect()
  .then(() => client.query(`ALTER TABLE activities ADD COLUMN location_text VARCHAR(255) DEFAULT '';`))
  .then(() => client.query(`ALTER TABLE activities ADD COLUMN category VARCHAR(100) DEFAULT 'Tất cả';`))
  .then(() => client.query(`ALTER TABLE activities ADD COLUMN image_url TEXT DEFAULT '';`))
  .then(() => { console.log('Done'); client.end(); })
  .catch(console.error);
