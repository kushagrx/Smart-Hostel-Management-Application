import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import api from '../utils/api';
import { isAdmin } from '../utils/authUtils';
import { useAuth } from './AuthContext';

// ─── Types ────────────────────────────────────────────
interface RawNotification { id: string; title: string; subtitle: string; type: string; time: string; }

interface NotificationContextType {
    adminUnreadCount: number;
    studentUnreadCount: number;
}

// ─── Context ──────────────────────────────────────────
const NotificationContext = createContext<NotificationContextType>({
    adminUnreadCount: 0,
    studentUnreadCount: 0,
});

export const useNotificationContext = () => useContext(NotificationContext);

// ─── Provider ─────────────────────────────────────────
export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [adminUnreadCount, setAdminUnreadCount] = useState(0);
    const [studentUnreadCount, setStudentUnreadCount] = useState(0);

    const prevIdSetRef = useRef<Set<string>>(new Set());
    const isFirstFetch = useRef(true);

    const fetchAndCompare = useCallback(async () => {
        if (!user) return;

        const endpoint = isAdmin(user)
            ? '/notifications/admin'
            : '/notifications/student';

        try {
            const res = await api.get(endpoint);
            const data: RawNotification[] = res.data;

            if (isAdmin(user)) {
                setAdminUnreadCount(data.length);
            } else {
                setStudentUnreadCount(data.length);
            }

            // Track new notifications
            const newNotifs = data.filter(n => !prevIdSetRef.current.has(n.id));
            if (newNotifs.length > 0) {
                prevIdSetRef.current = new Set(data.map(n => n.id));
            }
        } catch {
            // Silently fail — network issues shouldn't crash the app
        }
    }, [user]);

    useEffect(() => {
        if (!user) return;

        // Reset on user change
        isFirstFetch.current = true;
        prevIdSetRef.current = new Set();

        fetchAndCompare();
        const interval = setInterval(fetchAndCompare, 10_000); // every 10s
        return () => clearInterval(interval);
    }, [user, fetchAndCompare]);

    return (
        <NotificationContext.Provider value={{ adminUnreadCount, studentUnreadCount }}>
            {children}
        </NotificationContext.Provider>
    );
}

