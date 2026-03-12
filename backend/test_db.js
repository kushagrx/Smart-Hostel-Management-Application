require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function check() {
    try {
        const res = await pool.query(`
      SELECT r.id, r.room_number, r.room_type, r.wifi_ssid, r.wifi_password, r.facilities
      FROM rooms r 
      ORDER BY r.id DESC 
      LIMIT 1
    `);
        console.log("Latest Room:", res.rows[0]);
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}
check();
