import api from './api';

export interface SearchResult {
    id: string;
    type: 'student' | 'room' | 'complaint';
    title: string;
    subtitle: string;
    data: any;
}

export const performGlobalSearch = async (searchText: string): Promise<SearchResult[]> => {
    if (!searchText || searchText.length < 1) return [];

    try {
        const response = await api.post('/search', { query: searchText });
        return response.data;
    } catch (error) {
        console.error("Global search error:", error);
        return [];
    }
};


