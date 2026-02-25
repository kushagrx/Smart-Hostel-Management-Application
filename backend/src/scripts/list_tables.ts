
import { pool } from '../config/db';

const listTables = async () => {
    try {
        const res = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE';
        `);
        console.log("Tables found:", res.rows.map(r => r.table_name));
    } catch (error) {
        console.error('Error listing tables:', error);
    } finally {
        pool.end();
    }
};

listTables();
