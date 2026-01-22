import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getAuthSafe, getDbSafe } from './firebase';

export interface LaundryRequestData {
    roomNo: string;
    studentName: string;
    clothesDetails: string;
    totalClothes: number;
    status: 'Pending' | 'In Progress' | 'Completed';
    userId: string;
}

export const submitLaundryRequest = async (
    roomNo: string,
    studentName: string,
    clothesDetails: string,
    totalClothes: number
): Promise<boolean> => {
    try {
        const db = getDbSafe();
        const auth = getAuthSafe();

        if (!db || !auth?.currentUser) {
            console.error("Database or User not auth");
            return false;
        }

        const requestData: LaundryRequestData = {
            roomNo,
            studentName,
            clothesDetails,
            totalClothes,
            status: 'Pending',
            userId: auth.currentUser.uid,
        };

        await addDoc(collection(db, 'laundry_requests'), {
            ...requestData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        return true;
    } catch (error) {
        console.error("Error submitting laundry request:", error);
        throw error;
    }
};
