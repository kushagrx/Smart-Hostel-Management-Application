import { Router } from 'express';
import { createOrder, getHistory, verifyPayment } from '../controllers/paymentController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/create-order', requireAuth, createOrder);
router.post('/verify', requireAuth, verifyPayment);
router.get('/history', requireAuth, getHistory);

export default router;
