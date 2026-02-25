import { create } from 'zustand';

export type AlertType = 'success' | 'error' | 'warning' | 'info';
export interface AlertButton {
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
}

interface AlertState {
    visible: boolean;
    title: string;
    message: string;
    buttons: AlertButton[];
    type: AlertType;
    showAlert: (title: string, message: string, buttons?: AlertButton[], type?: AlertType) => void;
    hideAlert: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
    visible: false,
    title: '',
    message: '',
    buttons: [],
    type: 'info',
    showAlert: (title, message, buttons = [], initialType) => {
        let detectedType: AlertType = 'info';
        if (initialType) {
            detectedType = initialType;
        } else {
            const lowerTitle = title.toLowerCase();
            if (lowerTitle.includes('error') || lowerTitle.includes('fail')) detectedType = 'error';
            else if (lowerTitle.includes('success')) detectedType = 'success';
            else if (lowerTitle.includes('warn') || lowerTitle.includes('confirm')) detectedType = 'warning';
        }

        set({
            title,
            message,
            buttons,
            type: detectedType,
            visible: true,
        });
    },
    hideAlert: () => set({ visible: false }),
}));
