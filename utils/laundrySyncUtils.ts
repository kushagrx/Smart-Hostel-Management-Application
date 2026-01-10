import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { getDbSafe } from './firebase';

export interface LaundrySettings {
    pickupDay: string;
    pickupTime: string;
    pickupPeriod: 'AM' | 'PM';
    dropoffDay: string;
    dropoffTime: string;
    dropoffPeriod: 'AM' | 'PM';
    status: 'On Schedule' | 'Delayed' | 'No Service' | 'Holiday';
    message: string;
    lastUpdated?: any;
}

const COLLECTION_NAME = 'laundry';
const DOC_ID = 'settings';

/**
 * Subscribe to laundry settings updates
 */
export const subscribeToLaundry = (onUpdate: (data: LaundrySettings) => void) => {
    const db = getDbSafe();
    if (!db) return () => { };

    const ref = doc(db, COLLECTION_NAME, DOC_ID);

    const unsubscribe = onSnapshot(ref, (docSnap) => {
        if (docSnap.exists()) {
            onUpdate(docSnap.data() as LaundrySettings);
        } else {
            // Default settings if document doesn't exist
            onUpdate({
                pickupDay: 'Monday',
                pickupTime: '09:00',
                pickupPeriod: 'AM',
                dropoffDay: 'Wednesday',
                dropoffTime: '05:00',
                dropoffPeriod: 'PM',
                status: 'On Schedule',
                message: 'Regular service available',
            });
        }
    }, (error) => {
        console.error("Error fetching laundry settings:", error);
    });

    return unsubscribe;
};

/**
 * Update laundry settings
 */
export const updateLaundrySettings = async (settings: LaundrySettings) => {
    const db = getDbSafe();
    if (!db) throw new Error("Database not initialized");

    const ref = doc(db, COLLECTION_NAME, DOC_ID);
    await setDoc(ref, {
        ...settings,
        lastUpdated: serverTimestamp()
    }, { merge: true });
};
