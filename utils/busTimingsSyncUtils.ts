import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc
} from 'firebase/firestore';
import { getDbSafe } from './firebase';

export interface BusRoute {
    id: string;
    route: string;
    times: string[]; // e.g. ["8:00 AM", "10:00 AM"]
    createdAt?: any;
}

const COLLECTION_NAME = 'busTimings';

/**
 * Subscribe to all bus timings in real-time
 */
export const subscribeToBusTimings = (onUpdate: (timings: BusRoute[]) => void) => {
    const db = getDbSafe();
    if (!db) return () => { };

    const q = query(collection(db, COLLECTION_NAME), orderBy('route', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as BusRoute[];
        onUpdate(data);
    }, (error) => {
        console.error("Error fetching bus timings:", error);
    });

    return unsubscribe;
};

/**
 * Add a new bus route
 */
export const addBusRoute = async (route: string, times: string[]) => {
    const db = getDbSafe();
    if (!db) throw new Error("Database not initialized");

    await addDoc(collection(db, COLLECTION_NAME), {
        route,
        times,
        createdAt: serverTimestamp()
    });
};

/**
 * Update an existing bus route
 */
export const updateBusRoute = async (id: string, data: Partial<BusRoute>) => {
    const db = getDbSafe();
    if (!db) throw new Error("Database not initialized");

    const ref = doc(db, COLLECTION_NAME, id);
    await updateDoc(ref, data);
};

/**
 * Delete a bus route
 */
export const deleteBusRoute = async (id: string) => {
    const db = getDbSafe();
    if (!db) throw new Error("Database not initialized");

    await deleteDoc(doc(db, COLLECTION_NAME, id));
};
