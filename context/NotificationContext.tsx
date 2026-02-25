import { useNotificationStore } from '../store/useNotificationStore';

// Compatibility hook
export const useNotificationContext = () => {
    const { adminUnreadCount, studentUnreadCount } = useNotificationStore();
    return { adminUnreadCount, studentUnreadCount };
};

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

