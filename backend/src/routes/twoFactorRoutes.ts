import express from 'express';
import { generateSecret, verifyAndEnable, disableTwoFactor, getTwoFactorStatus, generateSmsOtp, verifySmsOtp, disableSms2FA } from '../controllers/twoFactorController';
import { requireAuth as authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

// App Authenticator
router.post('/generate', generateSecret);
router.post('/verify', verifyAndEnable);
router.post('/disable', disableTwoFactor);

// SMS Authenticator
router.post('/sms/generate', generateSmsOtp);
router.post('/sms/verify', verifySmsOtp);
router.post('/sms/disable', disableSms2FA);

router.get('/status', getTwoFactorStatus);

export default router;
