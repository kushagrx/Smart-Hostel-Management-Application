import { pool } from '../config/db';

async function dropColumn() {
    const client = await pool.connect();
    try {
        console.log('🚀 Starting column removal...');
        await client.query(`ALTER TABLE students DROP COLUMN IF EXISTS personal_email`);
        console.log('✅ personal_email column dropped successfully!');
    } catch (error) {
        console.error('❌ Failed to drop column:', error);
    } finally {
        client.release();
        process.exit();
    }
}

dropColumn();
