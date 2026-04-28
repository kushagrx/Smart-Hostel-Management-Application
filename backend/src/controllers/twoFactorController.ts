import { Request, Response } from 'express';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import twilio from 'twilio';
import { query } from '../config/db';

export const generateSecret = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).currentUser?.id;
        const email = (req as any).currentUser?.email;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const secret = speakeasy.generateSecret({
            name: `SmartStay (${email})`
        });

        await query('UPDATE users SET two_factor_secret = $1 WHERE id = $2', [secret.base32, userId]);

        const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url as string);

        res.json({ secret: secret.base32, qrCodeUrl });
    } catch (error) {
        console.error('Error generating 2FA secret:', error);
        res.status(500).json({ error: 'Failed to generate 2FA secret' });
    }
};

export const verifyAndEnable = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).currentUser?.id;
        const { token } = req.body;

        if (!userId || !token) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        const userResult = await query('SELECT two_factor_secret FROM users WHERE id = $1', [userId]);
        const secret = userResult.rows[0]?.two_factor_secret;

        if (!secret) {
            res.status(400).json({ error: '2FA secret not generated' });
            return;
        }

        const verified = speakeasy.totp.verify({
            secret,
            encoding: 'base32',
            token
        });

        if (verified) {
            await query('UPDATE users SET two_factor_enabled = TRUE WHERE id = $1', [userId]);
            res.json({ success: true, message: '2FA enabled successfully' });
        } else {
            res.status(400).json({ error: 'Invalid token' });
        }
    } catch (error) {
        console.error('Error verifying 2FA token:', error);
        res.status(500).json({ error: 'Failed to verify token' });
    }
};

export const getTwoFactorStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).currentUser?.id;
        const result = await query('SELECT two_factor_enabled, sms_2fa_enabled, phone_number FROM users WHERE id = $1', [userId]);
        res.json({ 
            enabled: result.rows[0]?.two_factor_enabled || false,
            smsEnabled: result.rows[0]?.sms_2fa_enabled || false,
            phoneNumber: result.rows[0]?.phone_number || null
        });
    } catch (error) {
        console.error('Error fetching 2FA status:', error);
        res.status(500).json({ error: 'Failed to fetch status' });
    }
};

export const disableTwoFactor = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).currentUser?.id;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        await query('UPDATE users SET two_factor_enabled = FALSE, two_factor_secret = NULL WHERE id = $1', [userId]);
        res.json({ success: true, message: '2FA disabled successfully' });
    } catch (error) {
        console.error('Error disabling 2FA:', error);
        res.status(500).json({ error: 'Failed to disable 2FA' });
    }
};

// --- SMS 2FA Methods ---

export const generateSmsOtp = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).currentUser?.id;
        const { phoneNumber } = req.body; // Provided when setting up initially, or missing if just logging in

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const userResult = await query('SELECT phone_number FROM users WHERE id = $1', [userId]);
        const targetPhone = phoneNumber || userResult.rows[0]?.phone_number;

        if (!targetPhone) {
            res.status(400).json({ error: 'Phone number is required' });
            return;
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        // Expires in 5 minutes
        const expires = new Date(Date.now() + 5 * 60000);

        await query('UPDATE users SET sms_otp = $1, sms_otp_expires = $2 WHERE id = $3', [otp, expires, userId]);

        // Send via Twilio
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
            const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
            await client.messages.create({
                body: `Your SmartStay verification code is: ${otp}`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: targetPhone
            });
        } else {
            console.error('Twilio credentials missing. Printing OTP to console: ', otp);
        }

        res.json({ success: true, message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Error generating SMS OTP:', error);
        res.status(500).json({ error: 'Failed to generate OTP' });
    }
};

export const verifySmsOtp = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).currentUser?.id;
        const { token, phoneNumber } = req.body;

        if (!userId || !token) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        const userResult = await query('SELECT sms_otp, sms_otp_expires FROM users WHERE id = $1', [userId]);
        const { sms_otp, sms_otp_expires } = userResult.rows[0] || {};

        if (!sms_otp || !sms_otp_expires || new Date() > new Date(sms_otp_expires)) {
            res.status(400).json({ error: 'OTP expired or not requested' });
            return;
        }

        if (token === sms_otp) {
            // Setup complete or verified
            let updateQuery = 'UPDATE users SET sms_2fa_enabled = TRUE, sms_otp = NULL, sms_otp_expires = NULL WHERE id = $1';
            let params = [userId];

            if (phoneNumber) {
                updateQuery = 'UPDATE users SET sms_2fa_enabled = TRUE, phone_number = $1, sms_otp = NULL, sms_otp_expires = NULL WHERE id = $2';
                params = [phoneNumber, userId];
            }

            await query(updateQuery, params);
            res.json({ success: true, message: 'SMS 2FA enabled successfully' });
        } else {
            res.status(400).json({ error: 'Invalid token' });
        }
    } catch (error) {
        console.error('Error verifying SMS OTP:', error);
        res.status(500).json({ error: 'Failed to verify token' });
    }
};

export const disableSms2FA = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).currentUser?.id;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        await query('UPDATE users SET sms_2fa_enabled = FALSE, phone_number = NULL, sms_otp = NULL, sms_otp_expires = NULL WHERE id = $1', [userId]);
        res.json({ success: true, message: 'SMS 2FA disabled successfully' });
    } catch (error) {
        console.error('Error disabling SMS 2FA:', error);
        res.status(500).json({ error: 'Failed to disable SMS 2FA' });
    }
};

