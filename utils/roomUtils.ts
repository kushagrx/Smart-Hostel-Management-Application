import {
    doc,
    runTransaction
} from 'firebase/firestore';

export const allocateRoom = async (db: any, roomNo: string, studentId: string, studentName: string) => {
    if (!roomNo || !studentId) return;
    const roomRef = doc(db, 'rooms', roomNo);

    await runTransaction(db, async (transaction: any) => {
        const roomDoc = await transaction.get(roomRef);

        if (!roomDoc.exists()) {
            transaction.set(roomRef, {
                id: roomNo,
                number: roomNo,
                capacity: 2,
                occupants: [studentId],
                occupantDetails: [{ id: studentId, name: studentName }],
                status: 'occupied',
                updatedAt: new Date()
            });
        } else {
            const data = roomDoc.data();
            const occupants = data.occupants || [];

            if (occupants.includes(studentId)) return; // Already there

            if (occupants.length >= 2) {
                throw new Error(`Room ${roomNo} is full.`);
            }

            const newOccupants = [...occupants, studentId];
            const currentDetails = data.occupantDetails || [];
            const newDetails = [...currentDetails, { id: studentId, name: studentName }];

            transaction.update(roomRef, {
                occupants: newOccupants,
                occupantDetails: newDetails,
                status: newOccupants.length >= 2 ? 'full' : 'occupied',
                updatedAt: new Date()
            });
        }
    });
};

export const deallocateRoom = async (db: any, roomNo: string, studentId: string) => {
    if (!roomNo || !studentId) return;
    const roomRef = doc(db, 'rooms', roomNo);

    await runTransaction(db, async (transaction: any) => {
        const roomDoc = await transaction.get(roomRef);
        if (!roomDoc.exists()) return;

        const data = roomDoc.data();
        const occupants = data.occupants || [];

        const newOccupants = occupants.filter((id: string) => id !== studentId);

        if (newOccupants.length === occupants.length) return; // Not found

        const currentDetails = data.occupantDetails || [];
        const newDetails = currentDetails.filter((d: any) => d.id !== studentId);

        const newStatus = newOccupants.length === 0 ? 'vacant' : 'occupied';

        transaction.update(roomRef, {
            occupants: newOccupants,
            occupantDetails: newDetails,
            status: newStatus,
            updatedAt: new Date()
        });
    });
};
