import * as Haptics from 'expo-haptics';
import { useAccessibilityStore } from '../store/useAccessibilityStore';

/**
 * A wrapper around expo-haptics that respects the user's global accessibility settings.
 */
export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light') => {
    const { hapticFeedback } = useAccessibilityStore.getState();
    
    // If haptics are disabled in accessibility settings, do nothing
    if (!hapticFeedback) return;

    switch (type) {
        case 'light':
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            break;
        case 'medium':
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            break;
        case 'heavy':
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            break;
        case 'success':
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            break;
        case 'warning':
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            break;
        case 'error':
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            break;
    }
};
