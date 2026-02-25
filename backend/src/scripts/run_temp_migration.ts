import fs from 'fs';
import path from 'path';
import { pool, query } from '../config/db';

const runMigration = async () => {
    try {
        const sqlPath = path.join(__dirname, '../../add_fee_columns.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        console.log('Running migration...');
        await query(sql);
        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await pool.end();
    }
};

runMigration();
