import { query } from './src/config/db';
query("SELECT column_name FROM information_schema.columns WHERE table_name = 'students'").then(res => { console.log(res.rows.map(r => r.column_name)); process.exit(0); }).catch(e => { console.error(e); process.exit(1); });
