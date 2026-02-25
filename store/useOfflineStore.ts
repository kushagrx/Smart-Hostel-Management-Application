import { create } from 'zustand';

interface OfflineState {
    isOnline: boolean;
    isLoading: boolean;
    lastSyncTime: Date | null;
    setOnline: (online: boolean) => void;
    setLoading: (loading: boolean) => void;
    syncData: () => Promise<void>;
}

export const useOfflineStore = create<OfflineState>((set) => ({
    isOnline: true,
    isLoading: false,
    lastSyncTime: null,
    setOnline: (isOnline) => set({ isOnline }),
    setLoading: (isLoading) => set({ isLoading }),
    syncData: async () => {
        set({ lastSyncTime: new Date() });
    },
}));
