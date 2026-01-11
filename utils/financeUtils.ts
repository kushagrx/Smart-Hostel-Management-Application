import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    runTransaction,
    serverTimestamp,
    setDoc,
    updateDoc,
    where
} from 'firebase/firestore';
import { getDbSafe } from './firebase';

export interface Payment {
    id: string;
    studentId: string; // Email/ID
    studentName: string;
    amount: number;
    type: 'Hostel Fee' | 'Mess Fee' | 'Security Deposit' | 'Fine' | 'Other';
    date: Date;
    method: 'Cash' | 'Online' | 'Check' | 'UPI';
    remarks?: string;
    receiptNumber: string;
}

export interface PaymentRequest {
    id: string;
    studentId: string;
    studentName: string;
    amount: number;
    type: string;
    description?: string;
    dueDate: Date;
    status: 'pending' | 'paid_unverified' | 'verified' | 'overdue';
    createdAt: Date;
    transactionId?: string; // Filled by student
    paidAt?: any;
    receiptNumber?: string;
}

export interface FeeDetails {
    totalDue: number;
    amountPaid: number;
    lastPaymentDate?: any; // Timestamp
    status: 'Paid' | 'Pending' | 'Overdue';
}

const PAYMENTS_COL = 'payments';
const REQUESTS_COL = 'payment_requests';
const ALLOCATIONS_COL = 'allocations';
const SETTINGS_COL = 'settings';
const FINANCE_SETTINGS_DOC = 'finance';

// --- Settings ---

export const savePaymentSettings = async (upiId: string, payeeName: string) => {
    const db = getDbSafe();
    if (!db) return;
    await setDoc(doc(db, SETTINGS_COL, FINANCE_SETTINGS_DOC), {
        upiId,
        payeeName,
        updatedAt: serverTimestamp()
    });
};

export const getPaymentSettings = async () => {
    const db = getDbSafe();
    if (!db) return null;
    const docSnap = await getDoc(doc(db, SETTINGS_COL, FINANCE_SETTINGS_DOC));
    return docSnap.exists() ? docSnap.data() as { upiId: string, payeeName: string } : null;
};


// --- Database Operations ---

/**
 * Create a Payment Request (Invoice)
 */
export const createPaymentRequest = async (
    studentId: string,
    studentName: string,
    amount: number,
    type: string,
    dueDate: Date,
    description?: string
) => {
    const db = getDbSafe();
    if (!db) throw new Error("Database not initialized");

    await addDoc(collection(db, REQUESTS_COL), {
        studentId,
        studentName,
        amount,
        type,
        dueDate,
        description: description || '',
        status: 'pending',
        createdAt: serverTimestamp()
    });
};

/**
 * Get Requests (Pending/All) for a Student
 */
export const getStudentRequests = async (studentId: string) => {
    const db = getDbSafe();
    if (!db) return [];

    // Sort logic might tricky depending on indexes, keep simple
    const q = query(collection(db, REQUESTS_COL), where('studentId', '==', studentId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data(), dueDate: d.data().dueDate?.toDate(), createdAt: d.data().createdAt?.toDate() })) as PaymentRequest[];
};

/**
 * Get All Requests (For Admin) - optionally filtered by status
 */
export const getAllRequests = async (status?: string) => {
    const db = getDbSafe();
    if (!db) return [];

    let q = query(collection(db, REQUESTS_COL), orderBy('createdAt', 'desc'));
    if (status) {
        q = query(collection(db, REQUESTS_COL), where('status', '==', status));
    }

    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data(), dueDate: d.data().dueDate?.toDate(), createdAt: d.data().createdAt?.toDate() })) as PaymentRequest[];
};

/**
 * Mark Request as Paid (Student Side)
 */
export const markRequestAsPaid = async (requestId: string, transactionId?: string) => {
    const db = getDbSafe();
    if (!db) return;
    await updateDoc(doc(db, REQUESTS_COL, requestId), {
        status: 'paid_unverified',
        transactionId: transactionId || '',
        paidAt: serverTimestamp()
    });
};

/**
 * Verify Request (Admin Side) - Converts Request to Official Payment Logic
 */
export const verifyPaymentRequest = async (requestId: string) => {
    const db = getDbSafe();
    if (!db) return;

    const reqRef = doc(db, REQUESTS_COL, requestId);
    const reqSnap = await getDoc(reqRef);
    if (!reqSnap.exists()) throw new Error("Request not found");

    const reqData = reqSnap.data() as PaymentRequest;

    // Use the existing recordPayment logic to finalize it
    // This handles receipt number generation and student fee balance update
    const receiptNo = await recordPayment(
        reqData.studentId,
        reqData.amount,
        reqData.type as Payment['type'], // Cast or ensure type safety
        'Online', // Assuming verified online payments
        `Verified Request: ${reqData.description || ''} `
    );

    // Update request status to verified
    await updateDoc(reqRef, {
        status: 'verified',
        receiptNumber: receiptNo
    });

    return receiptNo;
};


/**
 * Record a new payment (Direct or via Verification)
 */
export const recordPayment = async (
    studentId: string,
    amount: number,
    type: Payment['type'],
    method: Payment['method'],
    remarks?: string
) => {
    const db = getDbSafe();
    if (!db) throw new Error("Database not initialized");

    const studentRef = doc(db, ALLOCATIONS_COL, studentId);

    // Generate a simple receipt number (e.g., RCP-20231025-1234)
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const receiptNumber = `RCP - ${timestamp} -${random} `;

    try {
        await runTransaction(db, async (transaction) => {
            const studentDoc = await transaction.get(studentRef);
            if (!studentDoc.exists()) {
                throw new Error("Student not found"); // Should handle if student deleted
            }

            const studentData = studentDoc.data();
            const currentFees: FeeDetails = studentData.feeDetails || {
                totalDue: 0,
                amountPaid: 0,
                status: 'Pending'
            };

            // Update Fee Calculation
            const newAmountPaid = (currentFees.amountPaid || 0) + amount;
            // Reduce due amount if we track it?
            // For now, let's just increment paid. Proper double-entry is complex.
            // If totalDue was static, we just check against it.
            const newStatus = newAmountPaid >= currentFees.totalDue ? 'Paid' : 'Pending';

            const updatedFeeDetails: FeeDetails = {
                ...currentFees,
                amountPaid: newAmountPaid,
                status: newStatus,
                lastPaymentDate: serverTimestamp()
            };

            // 1. Update Student Doc
            transaction.update(studentRef, { feeDetails: updatedFeeDetails });

            // 2. Create Payment Record (We can't use addDoc in transaction directly for new ref, need doc ref)
            // But we can just create a ref with auto-id first if needed, or use a subcollection.
            // Standard way: Create ref, set data.
            const newPaymentRef = doc(collection(db, PAYMENTS_COL));
            transaction.set(newPaymentRef, {
                studentId,
                studentName: studentData.name || studentData.fullName || 'Unknown Student',
                amount,
                type,
                date: serverTimestamp(),
                method,
                remarks: remarks || '',
                receiptNumber
            });
        });

        return receiptNumber;
    } catch (e) {
        console.error("Error recording payment:", e);
        throw e;
    }
};

/**
 * Get recent payments (Global)
 */
export const getRecentPayments = async (limitCount = 20): Promise<Payment[]> => {
    const db = getDbSafe();
    if (!db) return [];

    try {
        const q = query(
            collection(db, PAYMENTS_COL),
            orderBy('date', 'desc'),
            limit(limitCount)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                date: data.date?.toDate() || new Date()
            } as Payment;
        });
    } catch (e) {
        console.error("Error fetching payments:", e);
        return [];
    }
};

/**
 * Get payments for a specific student
 */
export const getStudentPayments = async (studentId: string): Promise<Payment[]> => {
    const db = getDbSafe();
    if (!db) return [];

    try {
        const q = query(
            collection(db, PAYMENTS_COL),
            where('studentId', '==', studentId),
            orderBy('date', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                date: data.date?.toDate() || new Date()
            } as Payment;
        });
    } catch (e) {
        console.error("Error fetching student payments:", e);
        return [];
    }
};

/**
 * Delete a payment record
 */
export const deletePayment = async (paymentId: string) => {
    const db = getDbSafe();
    if (!db) throw new Error("Database not initialized");

    try {
        await deleteDoc(doc(db, PAYMENTS_COL, paymentId));
        return true;
    } catch (e) {
        console.error("Error deleting payment:", e);
        throw e;
    }
};


// --- PDF Receipt Generation ---

export const generateReceiptPDF = async (payment: Payment) => {
    try {
        const html = `
    < html >
    <head>
    <style>
    body { font - family: 'Helvetica', sans - serif; padding: 40px; color: #333; }
                        .header { text - align: center; margin - bottom: 40px; border - bottom: 2px solid #eee; padding - bottom: 20px; }
                        .logo { font - size: 24px; font - weight: bold; color: #004e92; margin - bottom: 5px; }
                        .subtitle { color: #666; font - size: 14px; }
                        .receipt - title { font - size: 20px; font - weight: bold; margin - bottom: 20px; text - transform: uppercase; color: #444; }
                        .row { display: flex; justify - content: space - between; margin - bottom: 10px; border - bottom: 1px solid #f5f5f5; padding - bottom: 8px; }
                        .label { font - weight: bold; color: #666; }
                        .value { font - weight: 500; }
                        .total { margin - top: 30px; border - top: 2px solid #333; padding - top: 15px; display: flex; justify - content: space - between; font - size: 18px; font - weight: bold; }
                        .footer { margin - top: 50px; text - align: center; font - size: 12px; color: #aaa; }
</style>
    </head>
    < body >
    <div class="header" >
        <div class="logo" > Smart Hostel </div>
            < div class="subtitle" > Official Payment Receipt </div>
                </div>

                < div class="receipt-title" > Receipt #${payment.receiptNumber} </div>

                    < div class="row" >
                        <span class="label" > Date </span>
                            < span class="value" > ${payment.date.toLocaleDateString()} ${payment.date.toLocaleTimeString()} </span>
                                </div>
                                < div class="row" >
                                    <span class="label" > Student Name </span>
                                        < span class="value" > ${payment.studentName} </span>
                                            </div>
                                            < div class="row" >
                                                <span class="label" > Student ID </span>
                                                    < span class="value" > ${payment.studentId} </span>
                                                        </div>
                                                        < div class="row" >
                                                            <span class="label" > Payment Type </span>
                                                                < span class="value" > ${payment.type} </span>
                                                                    </div>
                                                                    < div class="row" >
                                                                        <span class="label" > Payment Method </span>
                                                                            < span class="value" > ${payment.method} </span>
                                                                                </div>
                                                                                < div class="row" >
                                                                                    <span class="label" > Remarks </span>
                                                                                        < span class="value" > ${payment.remarks || '-'} </span>
                                                                                            </div>

                                                                                            < div class="total" >
                                                                                                <span>Total Paid </span>
                                                                                                    <span>₹${payment.amount.toLocaleString()} </span>
                                                                                                        </div>

                                                                                                        < div class="footer" >
                                                                                                            This is a computer - generated receipt.No signature required.< br />
                                                                                                                Generated on ${new Date().toLocaleString()}
</div>
    </body>
    </html>
        `;

        const { uri } = await Print.printToFileAsync({ html });
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });

    } catch (error) {
        console.error("Error generating receipt PDF:", error);
        throw new Error("Failed to generate PDF");
    }
};
