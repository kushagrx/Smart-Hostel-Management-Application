import {
    collection,
    doc,
    getDoc,
    onSnapshot,
    serverTimestamp,
    setDoc
} from 'firebase/firestore';
import { getDbSafe } from './firebase';

export interface MenuItem {
    dish: string;
    type: 'veg' | 'non-veg';
    highlight?: boolean;
}

export interface DayMenu {
    day: string; // "Monday", "Tuesday", etc.
    breakfast: MenuItem[];
    lunch: MenuItem[];
    snacks: MenuItem[];
    dinner: MenuItem[];
    lastUpdated?: any;
}

export type WeekMenu = { [key: string]: DayMenu };

export interface MessTimings {
    breakfast: string;
    lunch: string;
    snacks: string;
    dinner: string;
}

const COLLECTION_NAME = 'messMenu';
const SETTINGS_COLLECTION = 'messSettings';
const GLOBAL_SETTINGS_DOC = 'global';
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * Subscribe to the full week's menu in real-time
 */
export const subscribeToMenu = (onUpdate: (menu: WeekMenu) => void) => {
    const db = getDbSafe();
    if (!db) return () => { };

    const colRef = collection(db, COLLECTION_NAME);

    const unsubscribe = onSnapshot(colRef, (snapshot) => {
        const fullMenu: WeekMenu = {};

        snapshot.docs.forEach(doc => {
            if (DAYS.includes(doc.id)) {
                fullMenu[doc.id] = doc.data() as DayMenu;
            }
        });

        onUpdate(fullMenu);
    }, (error) => {
        console.error("Error fetching mess menu:", error);
    });

    return unsubscribe;
};

/**
 * Update a specific day's menu
 */
export const updateDayMenu = async (day: string, menuData: Omit<DayMenu, 'day' | 'lastUpdated'>) => {
    const db = getDbSafe();
    if (!db) throw new Error("Database not initialized");

    const ref = doc(db, COLLECTION_NAME, day);
    await setDoc(ref, {
        day,
        ...menuData,
        lastUpdated: serverTimestamp()
    }, { merge: true });
};

/**
 * Initialize default empty menu if needed
 */
export const initializeDay = async (day: string) => {
    const db = getDbSafe();
    if (!db) return;

    const ref = doc(db, COLLECTION_NAME, day);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
        await setDoc(ref, {
            day,
            breakfast: [],
            lunch: [],
            snacks: [],
            dinner: [],
            lastUpdated: serverTimestamp()
        });
    }
};

/**
 * Subscribe to global mess timings
 */
export const subscribeToMessTimings = (onUpdate: (timings: MessTimings) => void) => {
    const db = getDbSafe();
    if (!db) return () => { };

    const ref = doc(db, SETTINGS_COLLECTION, GLOBAL_SETTINGS_DOC);

    const unsubscribe = onSnapshot(ref, (doc) => {
        if (doc.exists()) {
            onUpdate(doc.data().timings as MessTimings);
        } else {
            // Return defaults if not set
            onUpdate({
                breakfast: '8:00 - 9:30 AM',
                lunch: '12:30 - 2:30 PM',
                snacks: '5:30 - 6:30 PM',
                dinner: '8:30 - 9:30 PM'
            });
        }
    }, (error) => {
        console.error("Error fetching mess timings:", error);
    });

    return unsubscribe;
};

/**
 * Update global mess timings
 */
export const updateMessTimings = async (timings: MessTimings) => {
    const db = getDbSafe();
    if (!db) throw new Error("Database not initialized");

    const ref = doc(db, SETTINGS_COLLECTION, GLOBAL_SETTINGS_DOC);
    await setDoc(ref, { timings }, { merge: true });
};
