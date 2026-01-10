import {
    Timestamp,
    addDoc,
    collection,
    doc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    updateDoc,
    where
} from 'firebase/firestore';
import { getDbSafe } from './firebase';

export interface LeaveRequest {
    id: string;
    studentName: string;
    studentRoom: string;
    studentEmail: string;
    startDate: string; // ISO String YYYY-MM-DD
    endDate: string;   // ISO String YYYY-MM-DD
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: any; // Timestamp
    days: number;
}

// Create a new leave request
export const createLeaveRequest = async (request: Omit<LeaveRequest, 'id' | 'status' | 'createdAt'>) => {
    const db = getDbSafe();
    if (!db) return null;

    try {
        const docRef = await addDoc(collection(db, 'leaves'), {
            ...request,
            status: 'pending',
            createdAt: Timestamp.now(),
        });
        return docRef.id;
    } catch (error) {
        console.error("Error creating leave request:", error);
        throw error;
    }
};

// Get leave requests for a specific student
export const getStudentLeaves = async (studentEmail: string): Promise<LeaveRequest[]> => {
    const db = getDbSafe();
    if (!db) return [];

    try {
        // Note: Creating a composite index might be required for filtering by email AND sorting by createdAt
        const q = query(
            collection(db, 'leaves'),
            where('studentEmail', '==', studentEmail),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as LeaveRequest));
    } catch (error) {
        console.error("Error fetching student leaves:", error);
        return [];
    }
};

// Get all leave requests (for Admin)
export const getAllLeaves = async (): Promise<LeaveRequest[]> => {
    const db = getDbSafe();
    if (!db) return [];

    try {
        const q = query(collection(db, 'leaves'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as LeaveRequest));
    } catch (error) {
        console.error("Error fetching all leaves:", error);
        return [];
    }
};

// Update leave status (Approve/Reject)
export const updateLeaveStatus = async (id: string, status: 'approved' | 'rejected') => {
    const db = getDbSafe();
    if (!db) return;

    try {
        const requestRef = doc(db, 'leaves', id);
        await updateDoc(requestRef, { status });
    } catch (error) {
        console.error("Error updating leave status:", error);
        throw error;
    }
};

// Subscribe to pending leave requests
export const subscribeToPendingLeaves = (
    callback: (leaves: LeaveRequest[]) => void,
    onError?: (error: any) => void
) => {
    const db = getDbSafe();
    if (!db) return () => { };

    try {
        const q = query(
            collection(db, 'leaves'),
            where('status', '==', 'pending'),
            orderBy('createdAt', 'desc')
        );

        return onSnapshot(q, (snapshot) => {
            const leaves = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as LeaveRequest));
            callback(leaves);
        }, (error) => {
            console.error("Error subscribing to pending leaves:", error);
            if (onError) onError(error);
        });
    } catch (error) {
        console.error("Error subscribing to pending leaves:", error);
        if (onError) onError(error);
        return () => { };
    }
};
