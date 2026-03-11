import { query } from './src/config/db';

async function migrate() {
    try {
        await query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS notification_preferences JSONB 
            DEFAULT '{"notices": true, "complaints": true, "leaves": true, "services": true, "payments": true, "mess": true, "laundry": true, "bus": true, "visitors": true}'::jsonb;
        `);
        console.log('Migration successful: Added notification_preferences to users.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
