import { pool } from '../config/db';

async function check() {
    const client = await pool.connect();
    try {
        const res = await client.query('SELECT room_number, room_type, capacity FROM rooms ORDER BY room_number LIMIT 10');
        res.rows.forEach(r => console.log(`${r.room_number} | ${r.room_type} | ${r.capacity}`));
    } catch (e) {
        console.error(e);
    } finally {
        client.release();
        process.exit();
    }
}
check();
