import { pool } from '../config/db';

const addImagesColumn = async () => {
    try {
        // Add images column
        await pool.query(`
            ALTER TABLE facilities 
            ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';
        `);
        console.log('Added images column to facilities table');

        // Migrate existing image_url data to images array
        await pool.query(`
            UPDATE facilities 
            SET images = ARRAY[image_url] 
            WHERE image_url IS NOT NULL AND image_url != '' AND (images IS NULL OR images = '{}');
        `);
        console.log('Migrated existing image_url to images array');

    } catch (error) {
        console.error('Error updating facilities table:', error);
    } finally {
        process.exit();
    }
};

addImagesColumn();
