import { create } from 'zustand';
import { getStoredUser, User } from '../utils/authUtils';

interface AuthState {
    user: User | null;
    isLoading: boolean;
    refreshUser: () => Promise<void>;
    setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: true,
    setUser: (user) => set({ user, isLoading: false }),
    refreshUser: async () => {
        set({ isLoading: true });
        try {
            const storedUser = await getStoredUser();
            set({ user: storedUser, isLoading: false });
        } catch (error) {
            console.error('Failed to refresh user:', error);
            set({ isLoading: false });
        }
    },
}));

// Initialization helper (can be called in RootLayout or a listener)
useAuthStore.getState().refreshUser();
