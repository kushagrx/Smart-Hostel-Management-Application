import { pool } from '../config/db';

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('🚀 Starting migration...');

        // 1. Users table
        console.log('Checking users table...');
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)`);

        // 2. Students table
        console.log('Checking students table...');
        await client.query(`ALTER TABLE students ADD COLUMN IF NOT EXISTS profile_photo VARCHAR(255)`);
        await client.query(`ALTER TABLE students ADD COLUMN IF NOT EXISTS fee_frequency VARCHAR(50) DEFAULT 'Monthly'`);
        await client.query(`ALTER TABLE students ADD COLUMN IF NOT EXISTS password VARCHAR(255)`);
        await client.query(`ALTER TABLE students ADD COLUMN IF NOT EXISTS last_notifications_cleared_at VARCHAR(50)`);

        // 3. Rooms table
        console.log('Checking rooms table...');
        await client.query(`ALTER TABLE rooms ADD COLUMN IF NOT EXISTS room_type VARCHAR(100)`);
        await client.query(`ALTER TABLE rooms ADD COLUMN IF NOT EXISTS facilities TEXT DEFAULT '[]'`);

        console.log('✅ Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        client.release();
        process.exit();
    }
}

migrate();
