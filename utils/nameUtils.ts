import api from './api';

export interface StudentData {
  fullName: string;
  rollNo: string;
  roomNo: string;
  collegeName: string;
  hostelName: string;
  dob: string;
  phone: string;
  personalEmail: string;
  googleEmail?: string;
  collegeEmail?: string;
  status: 'active' | 'inactive';
  dues: number;
  wifiSSID: string;
  wifiPassword: string;
  email: string;
  address: string;
  fatherName: string;
  fatherPhone: string;
  motherName: string;
  motherPhone: string;
  bloodGroup: string;
  medicalHistory: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  feeFrequency: string;
  profilePhoto?: string;
  lastNotificationsClearedAt?: number;
  id?: string; // Added field because backend returns it now
}

export const fetchUserData = async (): Promise<StudentData> => {
  try {
    const response = await api.get('/students/profile');
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

export const getInitial = (name: string) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
};