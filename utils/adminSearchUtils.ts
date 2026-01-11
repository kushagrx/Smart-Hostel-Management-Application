import { collection, endAt, getDocs, limit, orderBy, query, startAt } from 'firebase/firestore';
import { getDbSafe } from './firebase';

export interface SearchResult {
    id: string;
    type: 'student' | 'room' | 'complaint';
    title: string;
    subtitle: string;
    data: any;
}

export const performGlobalSearch = async (searchText: string): Promise<SearchResult[]> => {
    const db = getDbSafe();
    if (!db || !searchText || searchText.length < 1) return [];

    const term = searchText.trim();
    // 1. Original term (exactly as typed)
    const searchEnd = term + '\uf8ff';

    // 2. Title Cased term (e.g. "shas" -> "Shas") - covers common name storage
    const titleTerm = term.charAt(0).toUpperCase() + term.slice(1).toLowerCase();
    const titleSearchEnd = titleTerm + '\uf8ff';

    try {
        const results: SearchResult[] = [];

        // Queries
        // A. Students by Name (Original Term)
        const studentsNameQueryOriginal = query(
            collection(db, 'allocations'),
            orderBy('name'),
            startAt(term),
            endAt(searchEnd),
            limit(3)
        );

        // B. Students by Name (Title Cased Term)
        // Only run this if it's different from original to avoid duplicate DB calls
        let studentsNameQueryTitle = null;
        if (titleTerm !== term) {
            studentsNameQueryTitle = query(
                collection(db, 'allocations'),
                orderBy('name'),
                startAt(titleTerm),
                endAt(titleSearchEnd),
                limit(3)
            );
        }

        // C. Students by RollNo (Original Term)
        const studentsRollQuery = query(
            collection(db, 'allocations'),
            orderBy('rollNo'),
            startAt(term),
            endAt(searchEnd),
            limit(3)
        );

        // D. Search Rooms - by Number
        const roomsQuery = query(
            collection(db, 'rooms'),
            orderBy('number'),
            startAt(term),
            endAt(searchEnd),
            limit(3)
        );

        // Execute Queries in Parallel
        const promises = [
            getDocs(studentsNameQueryOriginal),
            getDocs(studentsRollQuery),
            getDocs(roomsQuery)
        ];
        if (studentsNameQueryTitle) {
            promises.push(getDocs(studentsNameQueryTitle));
        }

        const snapshots = await Promise.all(promises);
        const nameSnapOriginal = snapshots[0];
        const rollSnap = snapshots[1];
        const roomsSnap = snapshots[2];
        const nameSnapTitle = studentsNameQueryTitle ? snapshots[3] : { empty: true, docs: [] };

        // Process Students (Deduplicate)
        const studentMap = new Map();

        const addStudent = (doc: any) => {
            if (!studentMap.has(doc.id)) {
                studentMap.set(doc.id, {
                    id: doc.id,
                    type: 'student',
                    title: doc.data().name,
                    subtitle: `Roll: ${doc.data().rollNo} • Room: ${doc.data().room}`,
                    data: doc.data()
                });
            }
        };

        nameSnapOriginal.forEach(addStudent);
        if (!nameSnapTitle.empty) {
            nameSnapTitle.docs.forEach(addStudent);
        }
        rollSnap.forEach(addStudent);

        results.push(...studentMap.values());

        // Process Rooms
        roomsSnap.forEach(doc => {
            const data = doc.data();
            const available = (data.capacity || 2) - (data.occupants?.length || 0);
            results.push({
                id: doc.id,
                type: 'room',
                title: `Room ${data.number}`,
                subtitle: `${data.status} • ${available} spots left`,
                data: data
            });
        });

        return results as SearchResult[];

    } catch (error) {
        console.error("Global search error:", error);
        return [];
    }
};
