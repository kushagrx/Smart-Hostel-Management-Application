import { useSettingsStore } from '../store/useSettingsStore';

/**
 * Formats a date or timestamp into a localized string based on the user's selected country.
 * @param date - The date to format (Date object or ISO string)
 * @param options - Intl.DateTimeFormatOptions
 * @returns A localized date string
 */
export const formatUniversalTime = (
    date: Date | string | number,
    options: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }
) => {
    const { country } = useSettingsStore.getState();
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

    try {
        return new Intl.DateTimeFormat(country.locale, {
            ...options,
            timeZone: country.timezone
        }).format(dateObj);
    } catch (e) {
        console.error('Failed to format universal time', e);
        return dateObj.toLocaleString();
    }
};

/**
 * Returns a relative time string (e.g., "2 hours ago") but handles it based on local/universal logic if needed.
 * For now, simple wrapper around current logic.
 */
export const formatRelativeTime = (date: Date | string | number) => {
    // Basic implementation, could be expanded with country-specific relative labels
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return formatUniversalTime(dateObj, { day: '2-digit', month: 'short' });
};

/**
 * Returns the current time adjusted to the user's selected country's timezone.
 */
export const getCurrentTimeInCountry = () => {
    const { country } = useSettingsStore.getState();
    const now = new Date();

    // We want the Date object representing the time in that country
    const options: Intl.DateTimeFormatOptions = {
        timeZone: country.timezone,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false
    };

    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(now);
    const dateMap: any = {};
    parts.forEach(p => dateMap[p.type] = p.value);

    // Month in Intl is 1-indexed (1-12)
    return new Date(
        parseInt(dateMap.year),
        parseInt(dateMap.month) - 1,
        parseInt(dateMap.day),
        parseInt(dateMap.hour === '24' ? '0' : dateMap.hour),
        parseInt(dateMap.minute),
        parseInt(dateMap.second)
    );
};
