import { collection, getDocs, onSnapshot, orderBy, query, where } from 'firebase/firestore';
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
  callback: (complaints: Complaint[]) => void
) => {
  try {
    const auth = getAuthSafe();
    const db = getDbSafe();

    if (!auth?.currentUser || !db) {
      callback([]);
      return () => {};
    }

    const email = auth.currentUser.email;
    if (!email) {
      callback([]);
      return () => {};
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
    });
  } catch (error) {
    console.error('Error subscribing to complaints:', error);
    return () => {};
  }
};