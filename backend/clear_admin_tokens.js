require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.query("UPDATE users SET push_token = NULL WHERE role = 'admin'").then(res => {
    console.log('Cleared admin push tokens:', res.rowCount);
    pool.end();
}).catch(console.error);
