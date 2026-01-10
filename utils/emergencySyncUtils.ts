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

export interface EmergencyContact {
    id: string;
    title: string;
    name: string;
    number: string;
    icon: string;
    createdAt?: any;
}

const COLLECTION_NAME = 'emergencyContacts';

/**
 * Subscribe to emergency contacts
 */
export const subscribeToContacts = (onUpdate: (contacts: EmergencyContact[]) => void) => {
    const db = getDbSafe();
    if (!db) return () => { };

    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const contacts: EmergencyContact[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as EmergencyContact));
        onUpdate(contacts);
    }, (error) => {
        console.error("Error fetching emergency contacts:", error);
    });

    return unsubscribe;
};

/**
 * Add a new emergency contact
 */
export const addContact = async (contact: Omit<EmergencyContact, 'id' | 'createdAt'>) => {
    const db = getDbSafe();
    if (!db) throw new Error("Database not initialized");

    await addDoc(collection(db, COLLECTION_NAME), {
        ...contact,
        createdAt: serverTimestamp()
    });
};

/**
 * Delete an emergency contact
 */
export const deleteContact = async (id: string) => {
    const db = getDbSafe();
    if (!db) throw new Error("Database not initialized");

    const ref = doc(db, COLLECTION_NAME, id);
    await deleteDoc(ref);
};

/**
 * Update an emergency contact
 */
export const updateContact = async (id: string, updates: Partial<EmergencyContact>) => {
    const db = getDbSafe();
    if (!db) throw new Error("Database not initialized");

    const ref = doc(db, COLLECTION_NAME, id);
    await updateDoc(ref, updates);
};
