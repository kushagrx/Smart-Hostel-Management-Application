import express from 'express';
import { getSessions, revokeSession, revokeAllOtherSessions } from '../controllers/sessionController';
import { requireAuth as authenticateToken } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all session routes
router.use(authenticateToken);

router.get('/', getSessions);
router.delete('/revoke-all', revokeAllOtherSessions);
router.delete('/:id', revokeSession);

export default router;
