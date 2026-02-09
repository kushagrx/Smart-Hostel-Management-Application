import api from './api';

export interface EmergencyContact {
    id: string;
    title: string;
    name: string;
    number: string;
    icon: string;
    createdAt?: any;
}

/**
 * Fetch emergency contacts (Polled for updates)
 */
export const subscribeToContacts = (onUpdate: (contacts: EmergencyContact[]) => void) => {
    const fetch = async () => {
        try {
            const res = await api.get('/services/contacts');

            // Transform to match interface if needed
            // Controller returns { id, name, role, phone, type, icon }

            const transformed = res.data.map((c: any) => ({
                id: c.id.toString(),
                title: c.role || c.type,
                name: c.name,
                number: c.phone,
                icon: c.icon || 'phone',
                createdAt: null
            }));
            onUpdate(transformed);
        } catch (error) {
            console.error("Error fetching emergency contacts:", error);
            onUpdate([]);
        }
    };

    fetch();
    const interval = setInterval(fetch, 60000);
    return () => clearInterval(interval);
};

export const addContact = async (contact: Omit<EmergencyContact, 'id' | 'createdAt'>) => {
    await api.post('/services/contacts', contact);
};

export const deleteContact = async (id: string) => {
    await api.delete(`/services/contacts/${id}`);
};

export const updateContact = async (id: string, updates: Partial<EmergencyContact>) => {
    await api.put(`/services/contacts/${id}`, updates);
};
