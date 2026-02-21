import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { API_URL } from './api';

export interface Student {
    id: string;
    fullName: string;
    rollNo: string;
    roomNo: string;
    email: string;
    phone: string;
    status: 'active' | 'inactive';
    dues: number;

    collegeName?: string;
    hostelName?: string;
    dob?: string;
    address?: string;
    collegeEmail?: string;
    fatherName?: string;
    fatherPhone?: string;
    motherName?: string;
    motherPhone?: string;
    bloodGroup?: string;
    medicalHistory?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    createdAt?: any;
    profilePhoto?: string;
}



/// ================= GET ALL =================
export const getAllStudents = async (): Promise<Student[]> => {
    try {
        const response = await api.get('/students/all');
        return response.data;
    } catch (error) {
        console.error("Error fetching students:", error);
        return [];
    }
};



/// ================= CREATE (ALLOT) =================
/// 🔥 THIS WAS CAUSING YOUR NETWORK ERROR
export const createStudent = async (studentData: any) => {

    try {

        console.log("📦 Creating student...");
        console.log("Is FormData:", studentData instanceof FormData);

        // ✅ HANDLE FORM DATA SAFELY (RN + FILE UPLOAD)
        if (
            studentData instanceof FormData ||
            studentData?.constructor?.name === 'FormData' ||
            (studentData?._parts && Array.isArray(studentData._parts))
        ) {

            const token = await AsyncStorage.getItem('userToken');

            const response = await fetch(`${API_URL}/students/allot`, {
                method: 'POST',
                body: studentData,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // DO NOT SET CONTENT TYPE HERE
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("❌ Create failed:", errorText);
                throw new Error(`Create failed: ${response.status} ${errorText}`);
            }

            const resData = await response.json();
            console.log("✅ Student created via fetch()", resData);
            return resData;
        }

        // ✅ NORMAL JSON CASE
        const res = await api.post('/students/allot', studentData);
        console.log("✅ Student created via axios()", res.data);
        return res.data;

    } catch (error) {
        console.error("Error creating student:", error);
        throw error;
    }
};



/// ================= DELETE =================
export const deleteStudent = async (id: string) => {
    try {
        await api.delete(`/students/${id}`);
    } catch (error) {
        console.error("Error deleting student:", error);
        throw error;
    }
};



/// ================= UPDATE =================
export const updateStudent = async (id: string, updates: any) => {

    try {

        // ✅ HANDLE FILE UPLOAD SAFELY
        if (
            updates instanceof FormData ||
            updates?.constructor?.name === 'FormData' ||
            (updates?._parts && Array.isArray(updates._parts))
        ) {

            const token = await AsyncStorage.getItem('userToken');

            const response = await fetch(`${API_URL}/students/${id}`, {
                method: 'PUT',
                body: updates,
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Upload failed: ${response.status} ${errorText}`);
            }

            return;
        }

        await api.put(`/students/${id}`, updates);

    } catch (error) {
        console.error("Error updating student:", error);
        throw error;
    }
};



/// ================= POLLING =================
/// ⚠️ keep but note this causes repeated calls every 10s
export const subscribeToStudents = (callback: (students: Student[]) => void) => {

    const fetchStudents = async () => {
        const data = await getAllStudents();
        callback(data);
    };

    fetchStudents();

    const interval = setInterval(fetchStudents, 10000);

    return () => clearInterval(interval);
};
