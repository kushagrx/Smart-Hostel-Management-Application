import { Router } from 'express';
import { changePassword, getCurrentUser, googleLogin, login, removePushToken, updatePushToken, verifyTwoFactorLogin, linkGoogle, unlinkGoogle } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.post('/google', googleLogin);
router.post('/login/verify-2fa', verifyTwoFactorLogin);
router.get('/me', requireAuth, getCurrentUser);
router.post('/change-password', requireAuth, changePassword);
router.post('/link-google', requireAuth, linkGoogle);
router.post('/unlink-google', requireAuth, unlinkGoogle);

router.post('/push-token', requireAuth, updatePushToken);
router.post('/push-token/remove', requireAuth, removePushToken);

export default router;
