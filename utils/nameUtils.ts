import { getAuthSafe, getDbSafe } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

export const getInitial = (name: string): string => {
  if (!name) return '';
  return name.trim().charAt(0).toUpperCase();
};

export interface StudentData {
  fullName: string;
  roomNo: string;
  rollNo?: string;
  collegeName?: string;
  age?: string;
  phone?: string;
  personalEmail?: string;
  status?: string;
  dues?: number;
  wifiSSID?: string;
}

export const userData: StudentData = {
  fullName: 'Loading...',
  roomNo: 'Loading...',
};

// Fetch user data from Firestore based on authenticated user
export const fetchUserData = async (): Promise<StudentData | null> => {
  try {
    const auth = getAuthSafe();
    const db = getDbSafe();

    if (!auth?.currentUser || !db) return null;

    const userEmail = auth.currentUser.email;
    
    // Try to fetch from allocations collection using email as ID
    const allocationRef = doc(db, 'allocations', userEmail || '');
    const allocationSnap = await getDoc(allocationRef);

    if (allocationSnap.exists()) {
      const data = allocationSnap.data();
      return {
        fullName: data.name || 'N/A',
        roomNo: data.room || 'N/A',
        rollNo: data.rollNo || 'N/A',
        collegeName: data.collegeName || 'N/A',
        age: data.age || 'N/A',
        phone: data.phone || 'N/A',
        personalEmail: data.personalEmail || userEmail || 'N/A',
        status: data.status || 'active',
        dues: data.dues || 0,
        wifiSSID: data.wifiSSID || 'ENET_' + (data.room || 'N/A'),
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};