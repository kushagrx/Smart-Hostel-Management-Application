
import { query } from '../config/db';

const addFrequencyColumns = async () => {
    try {
        console.log('Adding schedule_type column...');
        await query("ALTER TABLE bus_timings ADD COLUMN IF NOT EXISTS schedule_type VARCHAR(20) DEFAULT 'everyday'");

        console.log('Adding valid_date column...');
        await query("ALTER TABLE bus_timings ADD COLUMN IF NOT EXISTS valid_date DATE");

        console.log('Successfully updated bus_timings table with frequency columns');
    } catch (error) {
        console.error('Error adding frequency columns:', error);
    }
};

addFrequencyColumns();
