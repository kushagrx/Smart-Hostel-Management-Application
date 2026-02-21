import crypto from 'crypto';
import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import { query } from '../config/db';
import { getAdminTokens, getUserToken, sendPushNotification } from '../services/pushService';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YourKeyHere', // Replace with env var in prod
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'YourSecretHere',
});

// --- Create Order ---
export const createOrder = async (req: Request, res: Response) => {
    const userId = req.currentUser?.id;
    const { amount } = req.body; // Amount in INR

    if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
    }

    try {
        const options = {
            amount: amount * 100, // Amount in paise
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        // Save pending payment record? Optional for now, will save on verification
        res.json(order);
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
};

// --- Verify Payment ---
export const verifyPayment = async (req: Request, res: Response) => {
    const userId = req.currentUser?.id;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

    try {
        // 1. Verify Signature
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'YourSecretHere')
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ error: 'Invalid signature' });
        }

        // 2. Clear Dues for Student
        // Get student ID
        const studentRes = await query('SELECT id, dues FROM students WHERE user_id = $1', [userId]);
        if (studentRes.rows.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }
        const studentId = studentRes.rows[0].id;
        const currentDues = parseFloat(studentRes.rows[0].dues);

        // 3. Record Payment
        await query(
            'INSERT INTO payments (order_id, payment_id, student_id, amount, status) VALUES ($1, $2, $3, $4, $5)',
            [razorpay_order_id, razorpay_payment_id, studentId, amount, 'success']
        );

        // 4. Update Student Dues (Subtract amount paid)
        // Ensure dues don't go below 0? For now let's assume exact payment or partial.
        // If user pays full dues:
        const newDues = Math.max(0, currentDues - amount);
        await query('UPDATE students SET dues = $1 WHERE id = $2', [newDues, studentId]);

        // Notify Student
        if (userId) {
            const tokens = await getUserToken(userId);
            sendPushNotification(
                tokens,
                '✅ Payment Successful',
                `Your payment of ₹${amount} has been received. Your new dues are ₹${newDues}.`,
                { type: 'payment', id: razorpay_order_id }
            );
        }

        // Notify Admins
        const adminTokens = await getAdminTokens();
        sendPushNotification(
            adminTokens,
            'Payment Received',
            `Payment of ₹${amount} received`,
            { type: 'payment', id: razorpay_order_id } // Changed 'order_id' to 'razorpay_order_id'
        );

        res.json({ status: 'success', message: 'Payment verified and updated', newDues }); // Modified response

    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ error: 'Payment verification failed' });
    }
};

// --- Get Payment History ---
export const getHistory = async (req: Request, res: Response) => {
    const userId = req.currentUser?.id;
    try {
        const result = await query(`
            SELECT p.* 
            FROM payments p
            JOIN students s ON p.student_id = s.id
            WHERE s.user_id = $1
            ORDER BY p.created_at DESC
        `, [userId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
