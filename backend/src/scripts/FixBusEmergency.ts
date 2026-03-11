import { pool } from '../config/db';

const fixBusAndEmergency = async () => {
    try {
        console.log('--- Fixing Bus Timings and Emergency Contacts Schema ---');

        // 1. Bus Timings
        console.log('Syncing bus_timings table...');
        await pool.query(`
            ALTER TABLE bus_timings 
            ADD COLUMN IF NOT EXISTS message TEXT,
            ADD COLUMN IF NOT EXISTS schedule_type VARCHAR(50) DEFAULT 'everyday',
            ADD COLUMN IF NOT EXISTS valid_date DATE,
            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
        `);
        console.log('✅ bus_timings updated.');

        // 2. Emergency Contacts
        console.log('Syncing emergency_contacts table...');
        await pool.query(`
            ALTER TABLE emergency_contacts 
            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
        `);
        console.log('✅ emergency_contacts updated.');

        // 3. User Notifications Column
        console.log('Syncing users table for notifications...');
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS last_notifications_cleared_at TIMESTAMPTZ DEFAULT to_timestamp(0);
        `);
        console.log('✅ users updated.');

        console.log('--- Schema Fix Complete ---');
    } catch (error) {
        console.error('❌ Error in fixBusAndEmergency:', error);
    } finally {
        pool.end();
    }
};

fixBusAndEmergency();
