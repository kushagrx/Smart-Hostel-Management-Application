import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../utils/ThemeContext';
import Skeleton from './Skeleton';

export const StudentComplaintSkeleton = () => {
    const { colors, theme } = useTheme();
    const styles = getStyles(colors, theme);
    return (
        <View style={styles.card}>
            {/* Header: Title + Badge */}
            <View style={styles.header}>
                <Skeleton width="60%" height={20} borderRadius={6} />
                <Skeleton width={60} height={24} borderRadius={8} />
            </View>

            {/* Description lines */}
            <View style={{ gap: 8, marginBottom: 16 }}>
                <Skeleton width="100%" height={14} />
                <Skeleton width="90%" height={14} />
            </View>

            <View style={styles.divider} />

            {/* Footer: Date + Priority */}
            <View style={styles.footer}>
                <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                    <Skeleton width={14} height={14} borderRadius={7} />
                    <Skeleton width={80} height={14} />
                </View>
                <Skeleton width={70} height={20} borderRadius={6} />
            </View>
        </View>
    );
};

export const AdminComplaintSkeleton = () => {
    const { colors, theme } = useTheme();
    const styles = getStyles(colors, theme);
    return (
        <View style={styles.card}>
            <View style={styles.adminHeader}>
                {/* Avatar */}
                <Skeleton width={48} height={48} borderRadius={24} />
                {/* Name + Title */}
                <View style={{ flex: 1, gap: 6 }}>
                    <Skeleton width={120} height={18} borderRadius={4} />
                    <Skeleton width="80%" height={14} borderRadius={4} />
                </View>
                {/* Status Badge */}
                <Skeleton width={32} height={32} borderRadius={16} />
            </View>
        </View>
    );
}

export const NoticeSkeleton = () => {
    const { colors, theme } = useTheme();
    const styles = getStyles(colors, theme);
    return (
        <View style={styles.card}>
            {/* Header */}
            <View style={styles.noticeHeader}>
                <Skeleton width={36} height={36} borderRadius={10} />
                <View style={{ flex: 1, gap: 4 }}>
                    <Skeleton width={150} height={16} borderRadius={4} />
                    <Skeleton width={80} height={12} borderRadius={4} />
                </View>
            </View>
            {/* Body */}
            <View style={{ gap: 6, marginTop: 12 }}>
                <Skeleton width="100%" height={14} />
                <Skeleton width="95%" height={14} />
                <Skeleton width="60%" height={14} />
            </View>
        </View>
    )
}


// Lists

export const StudentComplaintListSkeleton = () => (
    <View style={{ gap: 16 }}>
        {[1, 2, 3, 4].map((i) => (
            <StudentComplaintSkeleton key={i} />
        ))}
    </View>
);

export const AdminComplaintListSkeleton = () => (
    <View style={{ gap: 16 }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
            <AdminComplaintSkeleton key={i} />
        ))}
    </View>
);

export const NoticeListSkeleton = () => (
    <View style={{ gap: 10 }}>
        {[1, 2, 3].map((i) => (
            <NoticeSkeleton key={i} />
        ))}
    </View>
);


const getStyles = (colors: any, theme: string) => StyleSheet.create({
    card: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 0,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    adminHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    noticeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginBottom: 12,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
});
