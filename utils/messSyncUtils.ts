import api from './api';
// import { CACHE_DURATION, CACHE_KEYS, cachedGet } from './cachedApi';

export interface MenuItem {
    dish: string;
    type: 'veg' | 'non-veg';
    highlight?: boolean;
}

export interface DayMenu {
    day: string;
    breakfast: MenuItem[];
    lunch: MenuItem[];
    snacks: MenuItem[];
    dinner: MenuItem[];
    timings?: MessTimings;
    lastUpdated?: any;
}

export type WeekMenu = { [key: string]: DayMenu };

export interface MessTimings {
    breakfast: string;
    lunch: string;
    snacks: string;
    dinner: string;
}

/**
 * Fetch the full week's menu from the API
 */
export const fetchMenu = async (): Promise<WeekMenu> => {
    try {
        const response = await api.get('/services/mess');
        const menuArray = response.data;

        // Convert array back to map object keyed by day name
        const menuMap: WeekMenu = {};
        if (Array.isArray(menuArray)) {
            menuArray.forEach((dayData: any) => {
                // Ensure meal fields are parsed if they are strings (JSON)
                const parseMeal = (meal: any) => {
                    if (typeof meal === 'string') {
                        try { return JSON.parse(meal); } catch (e) { return []; }
                    }
                    return meal || [];
                };

                menuMap[dayData.day] = {
                    day: dayData.day,
                    breakfast: parseMeal(dayData.breakfast),
                    lunch: parseMeal(dayData.lunch),
                    snacks: parseMeal(dayData.snacks),
                    dinner: parseMeal(dayData.dinner),
                    timings: dayData.timings,
                    lastUpdated: dayData.updated_at
                };
            });
        }
        return menuMap;
    } catch (error) {
        console.error("Error fetching mess menu:", error);
        return {};
    }
};

/**
 * Update a specific day's menu
 */
// Map day names to integers (0-6)
const dayMap: { [key: string]: number } = {
    'Sunday': 0,
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6
};

export const updateDayMenu = async (day: string, menuData: Partial<DayMenu>) => {
    try {
        const dayInt = dayMap[day];
        if (dayInt === undefined) throw new Error("Invalid day name");

        const meals = ['breakfast', 'lunch', 'snacks', 'dinner'];
        const promises = [];

        for (const meal of meals) {
            // @ts-ignore
            if (menuData[meal] || menuData.timings) {
                // @ts-ignore
                const mealMenu = menuData[meal] ? JSON.stringify(menuData[meal]) : '[]';
                // @ts-ignore
                const mealTiming = menuData.timings ? menuData.timings[meal] : undefined;

                promises.push(
                    api.post('/services/mess/update', {
                        dayOfWeek: dayInt,
                        mealType: meal,
                        menu: mealMenu,
                        timings: mealTiming
                    })
                );
            }
        }

        await Promise.all(promises);
    } catch (error) {
        console.error("Error updating mess menu:", error);
        throw error;
    }
};

/**
 * Subscribe to the full week's menu (Polled)
 */
export const subscribeToMenu = (onUpdate: (menu: WeekMenu) => void) => {
    // Initial fetch
    fetchMenu().then(onUpdate);

    // Poll every 10 seconds for updates (faster response)
    const interval = setInterval(() => {
        fetchMenu().then(onUpdate);
    }, 10000);

    return () => clearInterval(interval);
};

// --- Timings ---

export const subscribeToMessTimings = (onUpdate: (timings: MessTimings) => void) => {
    // TODO: Implement backend endpoint for generic settings
    // For now returning defaults
    const defaults = {
        breakfast: '8:00 - 9:30 AM',
        lunch: '12:30 - 2:30 PM',
        snacks: '5:30 - 6:30 PM',
        dinner: '8:30 - 9:30 PM'
    };
    onUpdate(defaults);
    return () => { };
};

export const updateMessTimings = async (timings: MessTimings) => {
    console.warn("Update timings API not implemented yet");
};

export const initializeDay = async (day: string) => {
    // No-op for SQL
};
