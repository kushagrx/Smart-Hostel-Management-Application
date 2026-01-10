import React, { createContext, ReactNode, useContext, useState } from 'react';
import CustomAlert, { AlertButton, AlertType } from '../components/CustomAlert';

interface AlertContextType {
    showAlert: (title: string, message: string, buttons?: AlertButton[], type?: AlertType) => void;
    hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider = ({ children }: { children: ReactNode }) => {
    const [visible, setVisible] = useState(false);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [buttons, setButtons] = useState<AlertButton[]>([]);
    const [type, setType] = useState<AlertType>('info');

    const showAlert = (
        title: string,
        message: string,
        buttons: AlertButton[] = [],
        initialType?: AlertType
    ) => {
        setTitle(title);
        setMessage(message);
        setButtons(buttons);

        // Auto-detect type from title if not provided
        if (initialType) {
            setType(initialType);
        } else {
            const lowerTitle = title.toLowerCase();
            if (lowerTitle.includes('error') || lowerTitle.includes('fail')) setType('error');
            else if (lowerTitle.includes('success')) setType('success');
            else if (lowerTitle.includes('warn') || lowerTitle.includes('confirm')) setType('warning');
            else setType('info');
        }

        setVisible(true);
    };

    const hideAlert = () => {
        setVisible(false);
    };

    return (
        <AlertContext.Provider value={{ showAlert, hideAlert }}>
            {children}
            <CustomAlert
                visible={visible}
                title={title}
                message={message}
                buttons={buttons}
                type={type}
                onClose={hideAlert}
            />
        </AlertContext.Provider>
    );
};

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return context;
};
