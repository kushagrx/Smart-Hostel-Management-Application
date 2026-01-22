import { doc, getDoc } from 'firebase/firestore';
import { getAuthSafe, getDbSafe } from './firebase';

export const getInitial = (name: string): string => {
  if (!name) return '';
  return name.trim().charAt(0).toUpperCase();
};

export interface StudentData {
  fullName: string;
  roomNo: string;
  rollNo?: string;
  collegeName?: string;
  hostelName?: string;
  dob?: string;
  phone?: string;
  personalEmail?: string;
  status?: string;
  dues?: number;
  wifiSSID?: string;
  wifiPassword?: string;
  email?: string;
  address?: string;
  fatherName?: string; // Added Father Name
  fatherPhone?: string; // Added Father Phone
  motherName?: string; // Added Mother Name
  motherPhone?: string; // Added Mother Phone
  bloodGroup?: string;
  medicalHistory?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
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

    const userEmail = auth.currentUser.email?.toLowerCase().trim();

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
        hostelName: data.hostelName || 'N/A',
        dob: data.dob || 'N/A',
        phone: data.phone || 'N/A',
        personalEmail: data.personalEmail || userEmail || 'N/A',
        status: data.status || 'active',
        dues: data.dues || 0,
        wifiSSID: data.wifiSSID || 'ENET_' + (data.room || 'N/A'),
        wifiPassword: data.wifiPassword,
        email: userEmail || undefined,
        address: data.address || 'N/A',
        fatherName: data.fatherName || 'N/A', // Map Father Name
        fatherPhone: data.fatherPhone || 'N/A',
        motherName: data.motherName || 'N/A', // Map Mother Name
        motherPhone: data.motherPhone || 'N/A',
        bloodGroup: data.bloodGroup || 'N/A',
        medicalHistory: data.medicalHistory || 'None',
        emergencyContactName: data.emergencyContactName || 'N/A',
        emergencyContactPhone: data.emergencyContactPhone || 'N/A',
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};