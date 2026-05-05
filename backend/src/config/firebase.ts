import admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

const serviceAccountPath = path.resolve(__dirname, '../../../smart-hostel-service-account.json');
let isInitialized = false;

if (fs.existsSync(serviceAccountPath)) {
    try {
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'smart-hostel-27f16.firebasestorage.app'
            });
        }
        isInitialized = true;
        console.log('✅ Firebase Admin SDK initialized globally.');
    } catch (err) {
        console.error('❌ Failed to initialize Firebase Admin SDK:', err);
    }
} else {
    console.warn('⚠️  firebase-service-account.json not found — Firebase services disabled.');
}

export const firebaseAdmin = admin;
export const firebaseInitialized = isInitialized;
export const getStorageBucket = () => isInitialized ? admin.storage().bucket() : null;
