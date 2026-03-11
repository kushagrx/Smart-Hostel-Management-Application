import { pool } from '../config/db';

const fixStudentsTable = async () => {
    try {
        console.log('--- Checking Students Table Schema ---');

        // 1. Get current columns
        const res = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'students'
        `);
        const columns = res.rows.map(r => r.column_name);
        console.log('Current columns:', columns);

        const requiredColumns = [
            { name: 'google_email', sql: 'ALTER TABLE students ADD COLUMN google_email VARCHAR(255) UNIQUE' },
            { name: 'personal_email', sql: 'ALTER TABLE students ADD COLUMN personal_email VARCHAR(255)' },
            { name: 'college_email', sql: 'ALTER TABLE students ADD COLUMN college_email VARCHAR(255)' },
            { name: 'total_fee', sql: 'ALTER TABLE students ADD COLUMN total_fee DECIMAL(10, 2) DEFAULT 0' }
        ];

        for (const col of requiredColumns) {
            if (!columns.includes(col.name)) {
                console.log(`Adding missing column: ${col.name}...`);
                await pool.query(col.sql);
                console.log(`✅ ${col.name} added!`);
            } else {
                console.log(`✔ ${col.name} already exists.`);
            }
        }

        console.log('--- Students Table Schema Fix Complete ---');
    } catch (error) {
        console.error('❌ Error fixing students table:', error);
    } finally {
        pool.end();
    }
};

fixStudentsTable();
