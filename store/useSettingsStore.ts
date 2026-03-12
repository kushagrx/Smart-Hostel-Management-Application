import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';

// Safe helper to access expo-localization
const getLocalization = () => {
    try {
        const Localization = require('expo-localization');
        return Localization;
    } catch (e) {
        console.warn('[SettingsStore] expo-localization could not be loaded');
        return null;
    }
};

export type Language = 'en' | 'hi';
export type Country = {
    code: string;
    name: string;
    locale: string;
    timezone: string;
};

export const COUNTRIES: Country[] = [
    { code: 'IN', name: 'India', locale: 'en-IN', timezone: 'Asia/Kolkata' },
    { code: 'US', name: 'USA', locale: 'en-US', timezone: 'America/New_York' },
    { code: 'GB', name: 'UK', locale: 'en-GB', timezone: 'Europe/London' },
    { code: 'AE', name: 'UAE', locale: 'en-AE', timezone: 'Asia/Dubai' },
];

interface SettingsState {
    language: Language;
    country: Country;
    onboardingCompleted: boolean;
    isLoaded: boolean;
    setLanguage: (lang: Language) => Promise<void>;
    setCountry: (country: Country) => Promise<void>;
    completeOnboarding: () => Promise<void>;
    loadSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
    language: 'en',
    country: COUNTRIES[0],
    onboardingCompleted: false,
    isLoaded: false,

    setLanguage: async (lang: Language) => {
        set({ language: lang });
        await AsyncStorage.setItem('app_language', lang);
    },

    setCountry: async (country: Country) => {
        set({ country });
        await AsyncStorage.setItem('app_country', JSON.stringify(country));
    },

    completeOnboarding: async () => {
        const { user } = useAuthStore.getState();
        if (!user || !user.id) return;

        set({ onboardingCompleted: true });
        await AsyncStorage.setItem(`onboarding_completed_${user.id}`, 'true');
    },

    loadSettings: async () => {
        const { user } = useAuthStore.getState();
        try {
            const [lang, country, onboarding] = await Promise.all([
                AsyncStorage.getItem('app_language'),
                AsyncStorage.getItem('app_country'),
                user?.id ? AsyncStorage.getItem(`onboarding_completed_${user.id}`) : Promise.resolve(null),
            ]);

            let detectedCountry = COUNTRIES[0];
            if (!country) {
                try {
                    const Localization = getLocalization();
                    if (Localization) {
                        // Auto-detect using modern expo-localization API (safe check for native module)
                        const locales = Localization.getLocales ? Localization.getLocales() : [];
                        const calendars = Localization.getCalendars ? Localization.getCalendars() : [];

                        const region = locales[0]?.regionCode;
                        const timezone = calendars[0]?.timeZone;
                        const locale = locales[0]?.languageTag || 'en-US';

                        const found = COUNTRIES.find(c => c.code === region);
                        if (found) {
                            detectedCountry = found;
                        } else {
                            // Fallback to detected timezone if match not found in curated list
                            detectedCountry = {
                                code: region || 'UNKNOWN',
                                name: region || 'Detected Location',
                                locale: locale,
                                timezone: timezone || 'UTC'
                            };
                        }
                    }
                } catch (e) {
                    console.warn('Localization auto-detection failed, using defaults', e);
                }
            }

            let language: Language = 'en';
            try {
                // Safeguard against missing native module 'ExpoLocalization'
                const Localization = getLocalization();
                if (Localization) {
                    const locales = Localization.getLocales ? Localization.getLocales() : [];
                    const detectedLang = locales[0]?.languageCode;
                    language = (lang as Language) || (detectedLang === 'hi' ? 'hi' : 'en');
                } else {
                    language = (lang as Language) || 'en';
                }
            } catch (e) {
                language = (lang as Language) || 'en';
            }

            set({
                language,
                country: country ? JSON.parse(country) : detectedCountry,
                onboardingCompleted: onboarding === 'true',
                isLoaded: true,
            });
        } catch (e) {
            console.error('Failed to load settings', e);
            set({ isLoaded: true });
        }
    },
}));

// We'll call loadSettings manually in the RootLayout or Login after auth state is ready
// useSettingsStore.getState().loadSettings(); // Removed auto-load
