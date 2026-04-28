import { Request, Response } from 'express';
import pool from '../config/db';

// Get all active sessions for the current user
export const getSessions = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).currentUser?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const result = await pool.query(
            'SELECT id, device_name, app_version, ip_address, location, last_active, is_current FROM user_sessions WHERE user_id = $1 ORDER BY last_active DESC',
            [userId]
        );

        res.json({ sessions: result.rows });
    } catch (error) {
        console.error('Error fetching sessions:', error);
        res.status(500).json({ error: 'Failed to fetch sessions' });
    }
};

// Revoke a specific session
export const revokeSession = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).currentUser?.id;
        const sessionId = req.params.id;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        await pool.query(
            'DELETE FROM user_sessions WHERE id = $1 AND user_id = $2',
            [sessionId, userId]
        );

        res.json({ message: 'Session revoked successfully' });
    } catch (error) {
        console.error('Error revoking session:', error);
        res.status(500).json({ error: 'Failed to revoke session' });
    }
};

// Revoke all other sessions except the current one
export const revokeAllOtherSessions = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).currentUser?.id;
        const currentSessionToken = req.body.refreshToken;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        if (currentSessionToken) {
            await pool.query(
                'DELETE FROM user_sessions WHERE user_id = $1 AND refresh_token != $2',
                [userId, currentSessionToken]
            );
        } else {
            // If we don't have the current token, we can use the is_current flag if it's set correctly
            // But usually the client passes their own refresh token to not delete it.
            await pool.query(
                'DELETE FROM user_sessions WHERE user_id = $1 AND is_current = false',
                [userId]
            );
        }

        res.json({ message: 'All other sessions revoked successfully' });
    } catch (error) {
        console.error('Error revoking all other sessions:', error);
        res.status(500).json({ error: 'Failed to revoke sessions' });
    }
};
