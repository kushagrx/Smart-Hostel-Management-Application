import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export interface AccessibilityState {
    fontSize: string;
    fontScale: number;
    reduceMotion: boolean;
    hapticFeedback: boolean;
    highContrast: boolean;
    boldText: boolean;
    isLoaded: boolean;

    setFontSize: (size: string) => Promise<void>;
    setReduceMotion: (value: boolean) => Promise<void>;
    setHapticFeedback: (value: boolean) => Promise<void>;
    setHighContrast: (value: boolean) => Promise<void>;
    setBoldText: (value: boolean) => Promise<void>;
    loadSettings: () => Promise<void>;
}

const getFontScale = (size: string): number => {
    switch (size) {
        case 'small': return 0.85;
        case 'large': return 1.15;
        case 'extra-large': return 1.3;
        case 'default':
        default: return 1.0;
    }
};

export const useAccessibilityStore = create<AccessibilityState>((set) => ({
    fontSize: 'default',
    fontScale: 1.0,
    reduceMotion: false,
    hapticFeedback: true,
    highContrast: false,
    boldText: false,
    isLoaded: false,

    setFontSize: async (size: string) => {
        set({ fontSize: size, fontScale: getFontScale(size) });
        await AsyncStorage.setItem('font_size', size);
    },

    setReduceMotion: async (value: boolean) => {
        set({ reduceMotion: value });
        await AsyncStorage.setItem('reduce_motion', String(value));
    },

    setHapticFeedback: async (value: boolean) => {
        set({ hapticFeedback: value });
        await AsyncStorage.setItem('haptic_feedback', String(value));
    },

    setHighContrast: async (value: boolean) => {
        set({ highContrast: value });
        await AsyncStorage.setItem('high_contrast', String(value));
    },

    setBoldText: async (value: boolean) => {
        set({ boldText: value });
        await AsyncStorage.setItem('bold_text', String(value));
    },

    loadSettings: async () => {
        try {
            const [fontSize, motion, haptic, contrast, bold] = await Promise.all([
                AsyncStorage.getItem('font_size'),
                AsyncStorage.getItem('reduce_motion'),
                AsyncStorage.getItem('haptic_feedback'),
                AsyncStorage.getItem('high_contrast'),
                AsyncStorage.getItem('bold_text'),
            ]);

            set({
                fontSize: fontSize || 'default',
                fontScale: getFontScale(fontSize || 'default'),
                reduceMotion: motion === 'true',
                hapticFeedback: haptic !== 'false', // Default to true
                highContrast: contrast === 'true',
                boldText: bold === 'true',
                isLoaded: true,
            });
        } catch (e) {
            console.error('Failed to load accessibility settings locally', e);
            set({ isLoaded: true });
        }
    }
}));

// Initialize store immediately
useAccessibilityStore.getState().loadSettings();
