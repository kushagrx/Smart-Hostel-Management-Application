import { useOfflineStore } from '../store/useOfflineStore';

// Compatibility hook
export function useOffline() {
    const { isOnline, isLoading, lastSyncTime, syncData } = useOfflineStore();
    return { isOnline, isLoading, lastSyncTime, syncData };
}

export function OfflineProvider({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
