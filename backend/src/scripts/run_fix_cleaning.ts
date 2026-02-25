
import fs from 'fs';
import path from 'path';
import { pool } from '../config/db';

const runMigration = async () => {
    try {
        const sqlPath = path.join(__dirname, '../../fix_cleaning_requests_fk.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        await pool.query(sql);
        console.log('Migration executed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        pool.end();
    }
};

runMigration();
