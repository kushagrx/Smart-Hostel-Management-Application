import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { query } from '../config/db';

const router = Router();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

router.post('/chat', requireAuth, async (req: Request, res: Response) => {
    try {
        const { message, chatHistory } = req.body;
        // @ts-ignore
        const userId = req.currentUser?.id;
        // @ts-ignore
        const role = req.currentUser?.role;

        if (!message) {
            res.status(400).json({ error: 'Message is required' });
            return;
        }

        // Get student_id if user is a student
        let studentId: number | null = null;
        if (role === 'student') {
            const sRes = await query('SELECT id FROM students WHERE user_id = $1', [userId]);
            if (sRes.rows.length > 0) {
                studentId = sRes.rows[0].id;
            }
        }

        // Forward to Python AI service
        const aiResponse = await fetch(`${AI_SERVICE_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message,
                student_id: studentId,
                user_role: role,
                chat_history: chatHistory || [],
            }),
        });

        if (!aiResponse.ok) {
            const error = await aiResponse.text();
            console.error('AI Service Error:', error);
            res.status(500).json({ error: `AI service unavailable: ${error}` });
            return;
        }

        const data = await aiResponse.json();
        res.json({ reply: data.reply });

    } catch (error) {
        console.error('AI Chat Route Error:', error);
        res.status(500).json({ error: 'Failed to get AI response' });
    }
});

export default router;
