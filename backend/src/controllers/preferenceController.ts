import { Request, Response } from 'express';
import pool from '../config/db';

export const getPreferences = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).currentUser?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const result = await pool.query('SELECT app_preferences FROM users WHERE id = $1', [userId]);
        const preferences = result.rows[0]?.app_preferences || {};

        res.json({ preferences });
    } catch (error) {
        console.error('Error fetching preferences:', error);
        res.status(500).json({ error: 'Failed to fetch preferences' });
    }
};

export const updatePreferences = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).currentUser?.id;
        const { preferences } = req.body; // Expecting an object of updates

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // We use jsonb_set or simple merge if we pull it first, 
        // Postgres has a great operator || to merge jsonb objects
        await pool.query(
            'UPDATE users SET app_preferences = COALESCE(app_preferences, \'{}\'::jsonb) || $1::jsonb WHERE id = $2',
            [JSON.stringify(preferences), userId]
        );

        res.json({ message: 'Preferences updated successfully' });
    } catch (error) {
        console.error('Error updating preferences:', error);
        res.status(500).json({ error: 'Failed to update preferences' });
    }
};
