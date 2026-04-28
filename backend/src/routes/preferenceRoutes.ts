import express from 'express';
import { getPreferences, updatePreferences } from '../controllers/preferenceController';
import { requireAuth as authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getPreferences);
router.put('/', updatePreferences);

export default router;
