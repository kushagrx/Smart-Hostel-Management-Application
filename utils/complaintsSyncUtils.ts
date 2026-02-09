import { DeviceEventEmitter } from 'react-native';
import api from './api';

const REFRESH_EVENT = 'REFRESH_COMPLAINTS';

export type Complaint = {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  status: 'open' | 'inProgress' | 'resolved' | 'closed';
  category: string;
  studentEmail: string;
  studentName: string;
  studentProfilePhoto?: string;
  createdAt: Date;
  updatedAt: Date;
};

export const fetchStudentComplaints = async (): Promise<Complaint[]> => {
  try {
    const response = await api.get('/services/complaints');
    return response.data.map((c: any) => ({
      ...c,
      createdAt: new Date(c.created_at || c.createdAt),
      updatedAt: new Date(c.updated_at || c.updatedAt)
    }));
  } catch (error) {
    console.error('Error fetching complaints:', error);
    return [];
  }
};

export const subscribeToStudentComplaints = (
  callback: (complaints: Complaint[]) => void,
  onError?: (error: any) => void
) => {
  const fetch = async () => {
    try {
      const data = await fetchStudentComplaints();
      callback(data);
    } catch (e) {
      if (onError) onError(e);
    }
  };
  fetch();
  const sub = DeviceEventEmitter.addListener(REFRESH_EVENT, fetch);
  const interval = setInterval(fetch, 10000);
  return () => {
    clearInterval(interval);
    sub.remove();
  };
};

// Admin Functions

export const getAllComplaints = async (): Promise<Complaint[]> => {
  try {
    const response = await api.get('/services/complaints/all');
    return response.data.map((c: any) => ({
      ...c,
      createdAt: new Date(c.created_at || c.createdAt),
      updatedAt: new Date(c.updated_at || c.updatedAt)
    }));
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
    await api.put(`/services/complaints/${complaintId}/status`, { status });
    DeviceEventEmitter.emit(REFRESH_EVENT);
  } catch (error) {
    console.error("Error updating complaint status:", error);
    throw error;
  }
};

export const subscribeToAllComplaints = (
  callback: (complaints: Complaint[]) => void,
  onError?: (error: any) => void
) => {
  const fetch = async () => {
    try {
      const data = await getAllComplaints();
      callback(data);
    } catch (e) {
      if (onError) onError(e);
    }
  };
  fetch();
  const sub = DeviceEventEmitter.addListener(REFRESH_EVENT, fetch);
  const interval = setInterval(fetch, 10000);
  return () => {
    clearInterval(interval);
    sub.remove();
  };
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
    await api.post('/services/complaints', {
      ...data,
      category: 'general'
    });
    DeviceEventEmitter.emit(REFRESH_EVENT);
  } catch (error) {
    console.error("Error creating complaint:", error);
    throw error;
  }
};