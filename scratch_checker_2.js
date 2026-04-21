const { Client } = require('pg');
const client = new Client({ connectionString: 'postgres://postgres@localhost:5432/quanly_hoatdong' });
client.connect()
.then(() => client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'activities'"))
.then(r => console.log(r.rows))
.catch(console.error)
.finally(() => client.end());
