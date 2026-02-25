
import fs from 'fs';
import path from 'path';
import { pool } from '../config/db';

const runMigration = async () => {
    try {
        const sqlPath = path.join(__dirname, '../../add_total_fee_column.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        await pool.query(sql);
        console.log('Migration executed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await pool.end();
    }
};

runMigration();
