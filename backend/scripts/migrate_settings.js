require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function migrate() {
    try {
        console.log("Adding app_preferences to users...");
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS app_preferences JSONB DEFAULT '{"auto_download_wifi": true, "auto_download_mobile": false, "data_saver": false, "reduce_motion": false, "haptic_feedback": true, "high_contrast": false, "bold_text": false, "font_size": "default"}'::jsonb;`);
        
        console.log("Creating user_sessions table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS user_sessions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                refresh_token VARCHAR(255) UNIQUE NOT NULL,
                device_name VARCHAR(255),
                app_version VARCHAR(50),
                ip_address VARCHAR(45),
                location VARCHAR(255),
                is_current BOOLEAN DEFAULT false,
                last_active TIMESTAMPTZ DEFAULT NOW(),
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        
        console.log("Migration successful");
    } catch(e) {
        console.error("Migration failed", e);
    } finally {
        await pool.end();
    }
}

migrate();
