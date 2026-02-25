import { useAuthStore } from '../store/useAuthStore';

// Compatibility hook
export const useAuth = () => {
    const { user, isLoading, refreshUser } = useAuthStore();
    return { user, isLoading, refreshUser };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
