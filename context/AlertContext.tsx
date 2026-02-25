import { useAlertStore } from '../store/useAlertStore';

// Compatibility hook
export const useAlert = () => {
    const { showAlert, hideAlert } = useAlertStore();
    return { showAlert, hideAlert };
};

export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
};
