import { addDoc, collection, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { getAuthSafe, getDbSafe } from './firebase';

export type ServiceRequest = {
    id: string;
    studentName: string;
    studentEmail: string;
    roomNo: string;
    serviceType: string; // e.g., 'Room Cleaning', 'Bathroom Cleaning'
    description?: string;
    status: 'pending' | 'approved' | 'completed' | 'rejected';
    estimatedTime?: string; // e.g., "Today 5:00 PM"
    adminNote?: string;
    createdAt: Date;
    updatedAt: Date;
};

// Student: Request a service
export const requestService = async (
    serviceType: string,
    description: string = '',
    studentName: string,
    roomNo: string
) => {
    try {
        const db = getDbSafe();
        const auth = getAuthSafe();

        if (!db || !auth?.currentUser?.email) throw new Error("Not authenticated");

        const requestsRef = collection(db, 'service_requests');
        await addDoc(requestsRef, {
            studentEmail: auth.currentUser.email,
            studentName,
            roomNo,
            serviceType,
            description,
            status: 'pending',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error("Error requesting service:", error);
        throw error;
    }
};

// Student: Subscribe to their own requests
export const subscribeToStudentRequests = (
    callback: (requests: ServiceRequest[]) => void
) => {
    const db = getDbSafe();
    const auth = getAuthSafe();

    if (!db || !auth?.currentUser?.email) return () => { };

    const q = query(
        collection(db, 'service_requests'),
        where('studentEmail', '==', auth.currentUser.email),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        } as ServiceRequest));
        callback(data);
    });
};

// Admin: Subscribe to ALL requests
export const subscribeToAllServiceRequests = (
    callback: (requests: ServiceRequest[]) => void
) => {
    const db = getDbSafe();
    if (!db) return () => { };

    const q = query(
        collection(db, 'service_requests'),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        } as ServiceRequest));
        callback(data);
    });
};

// Admin: Update Status (Approve/Deny)
export const updateServiceStatus = async (
    id: string,
    status: 'pending' | 'approved' | 'completed' | 'rejected',
    estimatedTime?: string,
    adminNote?: string
) => {
    const db = getDbSafe();
    if (!db) throw new Error("DB not init");

    const ref = doc(db, 'service_requests', id);
    await updateDoc(ref, {
        status,
        ...(estimatedTime && { estimatedTime }),
        ...(adminNote && { adminNote }),
        updatedAt: serverTimestamp()
    });
};
