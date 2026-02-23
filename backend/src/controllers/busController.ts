import { Request, Response } from 'express';
import { query } from '../config/db';
import { getAllStudentTokens, sendPushNotification } from '../services/pushService';

export const getAllBusTimings = async (req: Request, res: Response) => {
    try {
        // Only show:
        // 1. Everyday routes
        // 2. One-time routes where valid_date is today
        const result = await query(`
            SELECT * FROM bus_timings 
            WHERE is_active = true 
            AND (
                schedule_type = 'everyday' 
                OR (schedule_type = 'once' AND valid_date >= CURRENT_DATE)
            )
            ORDER BY valid_date ASC NULLS FIRST, departure_time ASC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching bus timings:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const createBusTiming = async (req: Request, res: Response) => {
    const { route_name, departure_time, destination, message, schedule_type } = req.body;

    let valid_date = null;
    let type = schedule_type || 'everyday';

    if (type === 'today') {
        valid_date = new Date();
        type = 'once';
    } else if (type === 'tomorrow') {
        valid_date = new Date();
        valid_date.setDate(valid_date.getDate() + 1);
        type = 'once';
    }

    try {
        const result = await query(
            'INSERT INTO bus_timings (route_name, departure_time, destination, message, schedule_type, valid_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [route_name, departure_time, destination, message, type, valid_date]
        );

        // Notify All Students
        const tokens = await getAllStudentTokens();
        const typeLabel = schedule_type === 'tomorrow' ? ' (Tomorrow)' : schedule_type === 'today' ? ' (Today Only)' : '';
        sendPushNotification(
            tokens,
            '🚌 New Bus Route' + typeLabel,
            `${route_name} to ${destination} added. Depart: ${departure_time}`,
            { type: 'bus', id: result.rows[0].id }
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error creating bus timing:', error);
        res.status(500).json({ error: (error as any).message });
    }
};

export const updateBusTiming = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { route_name, departure_time, destination, message, schedule_type } = req.body;

    let valid_date = null;
    let type = schedule_type || 'everyday';

    if (type === 'today') {
        valid_date = new Date();
        type = 'once';
    } else if (type === 'tomorrow') {
        valid_date = new Date();
        valid_date.setDate(valid_date.getDate() + 1);
        type = 'once';
    }

    try {
        const result = await query(
            'UPDATE bus_timings SET route_name = $1, departure_time = $2, destination = $3, message = $4, schedule_type = $5, valid_date = $6, updated_at = NOW() WHERE id = $7 RETURNING *',
            [route_name, departure_time, destination, message, type, valid_date, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'bus timing not found' });
        }

        // Notify All Students
        const tokens = await getAllStudentTokens();
        sendPushNotification(
            tokens,
            '🚌 Bus Schedule Updated',
            `Bus for ${route_name} to ${destination} has been updated.`,
            { type: 'bus', id }
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating bus timing:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const deleteBusTiming = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await query('DELETE FROM bus_timings WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting bus timing:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
