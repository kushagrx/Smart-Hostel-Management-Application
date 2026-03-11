require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const fs = require('fs');

pool.query('SELECT id, email, role, push_token FROM users').then(res => {
    fs.writeFileSync('users_push_tokens.json', JSON.stringify(res.rows, null, 2));
    pool.end();
}).catch(console.error);
