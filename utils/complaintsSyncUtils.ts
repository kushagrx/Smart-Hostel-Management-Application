import { addDoc, collection, doc, getDocs, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { getAuthSafe, getDbSafe } from './firebase';

export type Complaint = {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  status: 'open' | 'inProgress' | 'resolved' | 'closed';
  category: string;
  studentEmail: string;
  studentName: string;
  createdAt: Date;
  updatedAt: Date;
};

export const fetchStudentComplaints = async (): Promise<Complaint[]> => {
  try {
    const auth = getAuthSafe();
    const db = getDbSafe();

    if (!auth?.currentUser || !db) return [];

    const email = auth.currentUser.email;
    if (!email) return [];

    const complaintsRef = collection(db, 'complaints');
    const q = query(
      complaintsRef,
      where('studentEmail', '==', email),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    } as Complaint));
  } catch (error) {
    console.error('Error fetching complaints:', error);
    return [];
  }
};

export const subscribeToStudentComplaints = (
  callback: (complaints: Complaint[]) => void,
  onError?: (error: any) => void
) => {
  try {
    const auth = getAuthSafe();
    const db = getDbSafe();

    if (!auth?.currentUser || !db) {
      callback([]);
      return () => { };
    }

    const email = auth.currentUser.email;
    if (!email) {
      callback([]);
      return () => { };
    }

    const complaintsRef = collection(db, 'complaints');
    const q = query(
      complaintsRef,
      where('studentEmail', '==', email),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const complaints = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      } as Complaint));
      callback(complaints);
    }, (error) => {
      console.error("Error subscribing to student complaints:", error);
      if (onError) onError(error);
    });
  } catch (error) {
    console.error('Error subscribing to complaints:', error);
    if (onError) onError(error);
    return () => { };
  }
};

// Admin Functions

export const getAllComplaints = async (): Promise<Complaint[]> => {
  try {
    const db = getDbSafe();
    if (!db) return [];

    const complaintsRef = collection(db, 'complaints');
    const q = query(complaintsRef, orderBy('createdAt', 'desc'));

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    } as Complaint));
  } catch (error) {
    console.error("Error fetching all complaints:", error);
    return [];
  }
};

export const updateComplaintStatus = async (
  complaintId: string,
  status: 'open' | 'inProgress' | 'resolved' | 'closed'
) => {
  try {
    const db = getDbSafe();
    if (!db) throw new Error("Database not initialized");

    const complaintRef = doc(db, 'complaints', complaintId);

    await updateDoc(complaintRef, {
      status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating complaint status:", error);
    throw error;
  }
};

export const subscribeToAllComplaints = (
  callback: (complaints: Complaint[]) => void,
  onError?: (error: any) => void
) => {
  try {
    const db = getDbSafe();
    if (!db) {
      callback([]);
      return () => { };
    }

    const complaintsRef = collection(db, 'complaints');
    const q = query(complaintsRef, orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
      const complaints = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      } as Complaint));
      callback(complaints);
    }, (error) => {
      console.error("Error subscribing to all complaints:", error);
      if (onError) onError(error);
    });
  } catch (error) {
    console.error("Error subscribing to all complaints:", error);
    if (onError) onError(error);
    return () => { };
  }
};

export const createComplaint = async (data: {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  studentEmail: string;
  studentName: string;
  studentRoom: string;
}) => {
  try {
    const db = getDbSafe();
    if (!db) throw new Error("Database not initialized");

    const complaintRef = collection(db, 'complaints');
    // We need addDoc import at the top
    await addDoc(complaintRef, {
      ...data,
      status: 'open',
      category: 'general',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error creating complaint:", error);
    throw error;
  }
};