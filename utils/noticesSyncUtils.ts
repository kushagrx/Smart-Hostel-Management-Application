
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "./firebase";

// Shape of a notice used in the app
export interface Notice {
  id: string;
  title: string;
  body: string;
  priority?: "low" | "medium" | "high" | "emergency";
  date: Date;
}

/**
 * Subscribe to all hostel notices.
 * Used in (tabs)/alerts.tsx
 */
export const subscribeToNotices = (
  callback: (notices: Notice[]) => void
) => {
  const noticesRef = collection(db, "notices");

  // Latest first
  const q = query(noticesRef, orderBy("date", "desc"));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const notices: Notice[] = snapshot.docs.map((d) => {
      const data = d.data() as any;

      let date: Date;
      if (data.date instanceof Timestamp) {
        date = data.date.toDate();
      } else if (data.date) {
        date = new Date(data.date);
      } else {
        date = new Date();
      }

      return {
        id: d.id,
        title: data.title ?? "",
        body: data.body ?? "",
        priority: (data.priority as Notice["priority"]) ?? "low",
        date,
      };
    });

    callback(notices);
  });

  return unsubscribe;
};

/**
 * Helper functions for admin side
 * (optional, but useful for your admin dashboard)
 */

export const createNotice = async (notice: {
  title: string;
  body: string;
  priority?: Notice["priority"];
  date?: Date;
}) => {
  const noticesRef = collection(db, "notices");
  await addDoc(noticesRef, {
    title: notice.title,
    body: notice.body,
    priority: notice.priority ?? "low",
    date: notice.date ? Timestamp.fromDate(notice.date) : Timestamp.now(),
  });
};

export const updateNotice = async (
  id: string,
  updates: Partial<Omit<Notice, "id">>
) => {
  const ref = doc(db, "notices", id);
  const payload: any = { ...updates };

  if (updates.date) {
    payload.date = Timestamp.fromDate(updates.date);
  }

  await updateDoc(ref, payload);
};

export const deleteNotice = async (id: string) => {
  const ref = doc(db, "notices", id);
  await deleteDoc(ref);
};
