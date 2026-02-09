import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient'; // Added LinearGradient
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import StudentDetailsModal from '../../components/StudentDetailsModal';
import { useAlert } from '../../context/AlertContext';
import { API_BASE_URL } from '../../utils/api';

import { isAdmin, useUser } from '../../utils/authUtils';
import { ChatMessage, sendMessage, subscribeToMessages } from '../../utils/chatUtils';
import { deleteStudent } from '../../utils/studentUtils';
import { useTheme } from '../../utils/ThemeContext';

export default function ChatScreen() {
    const { id, name } = useLocalSearchParams<{ id: string, name?: string }>();
    const router = useRouter();
    const { colors, theme } = useTheme();
    const insets = useSafeAreaInsets();
    const user = useUser();
    const { showAlert } = useAlert();

    // Determine current user role/id
    const isUserAdmin = isAdmin(user);
    const currentUserId = isUserAdmin ? 'admin' : 'student';
    const currentUserName = isUserAdmin ? 'Admin' : ((user as any)?.displayName || (user as any)?.name || 'Student');

    // Determine Chat Title
    // If Admin -> Show Student Name (passed via params)
    // If Student -> Show "Admin Support"
    const chatTitle = name || (isUserAdmin ? 'Student Chat' : 'Admin Support');

    const [partnerStatus, setPartnerStatus] = useState<{ online: boolean; lastSeen: string | null }>({ online: false, lastSeen: null });
    const [partnerDetails, setPartnerDetails] = useState<any>(null);
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const flatListRef = React.useRef<FlatList>(null);

    useEffect(() => {
        if (!id) return;
        const unsubscribe = subscribeToMessages(id, (newMessages, status, details) => {
            setMessages(newMessages);
            if (status) setPartnerStatus(status);
            if (details) setPartnerDetails(details);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [id]);

    const handleSend = async () => {
        if (!inputText.trim() || !id) return;
        const textToSend = inputText.trim();
        setInputText(''); // Clear immediately for responsiveness
        await sendMessage(id, textToSend, {
            _id: currentUserId,
            name: currentUserName
        });
    };

    const handleDeleteStudent = () => {
        if (partnerDetails?.id) {
            showAlert(
                "Delete Student",
                `Are you sure you want to delete ${partnerDetails.name} (Room ${partnerDetails.room})? This action cannot be undone.`,
                [
                    { text: "Cancel", style: "cancel", onPress: () => { } },
                    {
                        text: "Delete",
                        style: "destructive",
                        onPress: async () => {
                            try {
                                await deleteStudent(partnerDetails.id);
                                setDetailsModalVisible(false);
                                router.replace('/admin/students');
                            } catch (error) {
                                showAlert('Error', 'Failed to delete student');
                            }
                        }
                    }
                ],
                'warning'
            );
        }
    };

    const handleEditStudent = () => {
        if (partnerDetails?.id) {
            setDetailsModalVisible(false);
            router.push({
                pathname: '/admin/students',
                params: { openEditId: partnerDetails.id }
            });
        }
    };

    // Date Divider Logic
    const getDateText = (date: Date) => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return date.toLocaleDateString();
    };

    const processMessages = (msgs: ChatMessage[]) => {
        const processed: (ChatMessage | { _id: string, type: 'day', date: string })[] = [];
        let lastDateString = '';

        // Iterate backwards (since messages are Newest -> Oldest)
        // For visual Top-to-Bottom:
        // List (Inverted): [Newest (Index 0), ..., Oldest (Index N)]
        // Visually: Oldest (Top) -> Newest (Bottom)

        // In renderItem, item at Index i is rendered.
        // We want a date header ABOVE the group of messages from that day.
        // Inverted list: Date Header should be inserted AFTER the last message of that day in the array (so it renders "above" it).

        // Let's create a new list for non-inverted logic first, then reverse it? 
        // Or just handle inverted logic.

        // Let's stick to standard handling logic:
        // We will pass the processed list to FlatList.

        // Array: [MsgToday1, MsgToday2, MsgYest1, MsgYest2]
        // We want: [MsgToday1, MsgToday2, DayToday, MsgYest1, MsgYest2, DayYest]

        for (let i = 0; i < msgs.length; i++) {
            const currentMsg = msgs[i];
            const currentDate = new Date(currentMsg.createdAt);
            const dateString = getDateText(currentDate);

            processed.push(currentMsg);

            // Check if next message (older) belongs to a different day
            const nextMsg = msgs[i + 1];
            if (nextMsg) {
                const nextDate = new Date(nextMsg.createdAt);
                const nextDateString = getDateText(nextDate);
                if (nextDateString !== dateString) {
                    processed.push({ _id: `day-${dateString}`, type: 'day', date: dateString });
                }
            } else {
                // Last message (Oldest) -> Always add its date separator
                processed.push({ _id: `day-${dateString}`, type: 'day', date: dateString });
            }
        }
        return processed;
    };

    const processedMessages = React.useMemo(() => processMessages(messages), [messages]);

    const renderMessage = ({ item, index }: { item: any, index: number }) => {
        if (item.type === 'day') {
            return (
                <View style={[styles.dateSeparator, { marginVertical: 16 }]}>
                    <Text style={[
                        styles.dateText,
                        {
                            color: theme === 'dark' ? '#94A3B8' : '#64748B',
                            backgroundColor: theme === 'dark' ? 'rgba(30, 41, 59, 0.8)' : 'rgba(241, 245, 249, 0.8)'
                        }
                    ]}>
                        {item.date}
                    </Text>
                </View>
            );
        }

        const isMe = item.user._id === currentUserId;
        const nextItem = processedMessages[index + 1];
        const isContinuous = nextItem &&
            'user' in nextItem &&
            'user' in item &&
            nextItem.user._id === item.user._id;

        return (
            <View style={[
                styles.messageRow,
                isMe ? styles.myMessageRow : styles.otherMessageRow,
                isContinuous ? { marginBottom: 2 } : { marginBottom: 12 }
            ]}>
                {/* Avatar for 'Other' user only */}
                {!isMe && !isContinuous && (
                    <View style={styles.messageAvatar}>
                        {item.user.avatar ? (
                            <Image
                                source={{ uri: `${API_BASE_URL}${item.user.avatar}` }}
                                style={{ width: 36, height: 36, borderRadius: 18 }}
                                contentFit="cover"
                            />
                        ) : (
                            <Text style={styles.avatarLetter}>{chatTitle.charAt(0)}</Text>
                        )}
                    </View>
                )}
                {!isMe && isContinuous && <View style={{ width: 36, marginRight: 8 }} />}

                <View style={[
                    styles.bubble,
                    isMe ? styles.myBubble : styles.otherBubble,
                    {
                        backgroundColor: isMe ? '#2563EB' : (theme === 'dark' ? '#1E293B' : '#FFFFFF'), // Modern Blue for me
                        borderBottomRightRadius: isMe && !isContinuous ? 4 : 20,
                        borderTopRightRadius: isMe && isContinuous ? 4 : 20,
                        borderBottomLeftRadius: !isMe && !isContinuous ? 4 : 20,
                        borderTopLeftRadius: !isMe && isContinuous ? 4 : 20,
                    }
                ]}>
                    <Text style={[
                        styles.messageText,
                        { color: isMe ? '#fff' : (theme === 'dark' ? '#F1F5F9' : '#1E293B') }
                    ]}>
                        {item.text}
                    </Text>
                    <Text style={[
                        styles.timeText,
                        { color: isMe ? 'rgba(255,255,255,0.7)' : '#94A3B8', marginTop: 4, alignSelf: 'flex-end', fontSize: 10 }
                    ]}>
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                        {isMe && (
                            <MaterialCommunityIcons
                                name={item.read ? "check-all" : "check"}
                                size={14}
                                color={item.read ? "#60A5FA" : "rgba(255,255,255,0.7)"}
                                style={{ marginLeft: 4 }}
                            />
                        )}
                    </Text>
                </View>
            </View>
        );
    };

    const getStatusText = () => {
        if (partnerStatus.online) return 'Online';
        if (!partnerStatus.lastSeen) return 'Offline';
        const date = new Date(partnerStatus.lastSeen);
        const diff = (new Date().getTime() - date.getTime()) / 1000 / 60; // minutes
        if (diff < 60) return `Last seen ${Math.floor(diff)}m ago`;
        if (diff < 1440) return `Last seen ${Math.floor(diff / 60)}h ago`;
        return 'Offline';
    };

    return (
        <View style={[styles.container, { backgroundColor: theme === 'dark' ? '#0F172A' : '#F1F5F9' }]}>
            {/* Modern Gradient Header */}
            <LinearGradient
                colors={['#1e3c72', '#2a5298']} // Deep Blue Gradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.header, { paddingTop: insets.top + 10 }]}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <MaterialCommunityIcons name="chevron-left" size={32} color="#fff" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.headerProfile}
                        onPress={() => partnerDetails && setDetailsModalVisible(true)}
                        disabled={!partnerDetails}
                    >
                        <View style={styles.headerAvatar}>
                            {partnerDetails?.profilePhoto ? (
                                <Image
                                    source={{ uri: `${API_BASE_URL}${partnerDetails.profilePhoto}` }}
                                    style={{ width: 44, height: 44, borderRadius: 22 }}
                                    contentFit="cover"
                                />
                            ) : (
                                <Text style={styles.headerAvatarText}>{chatTitle.charAt(0).toUpperCase()}</Text>
                            )}
                            {partnerStatus.online && <View style={styles.onlineDot} />}
                        </View>
                        <View>
                            <Text style={styles.headerName}>{chatTitle}</Text>
                            <Text style={[styles.headerStatus, { color: partnerStatus.online ? '#4ADE80' : 'rgba(255,255,255,0.7)' }]}>
                                {getStatusText()}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
            >
                {/* Chat Area */}
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={processedMessages}
                        renderItem={renderMessage}
                        keyExtractor={item => item._id}
                        inverted
                        style={{ flex: 1 }}
                        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20, paddingTop: 24 }}
                        showsVerticalScrollIndicator={false}
                    />
                )}

                {/* Floating Input Area */}
                <View style={[styles.inputWrapper, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                    <View style={[styles.inputContainer, { backgroundColor: theme === 'dark' ? '#1E293B' : '#fff' }]}>
                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="Type a message..."
                            placeholderTextColor={colors.textSecondary}
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                            maxLength={500}
                        />
                        <TouchableOpacity
                            style={[styles.sendBtn, { backgroundColor: inputText.trim().length > 0 ? '#2563EB' : '#CBD5E1' }]}
                            onPress={handleSend}
                            disabled={inputText.trim().length === 0}
                        >
                            <MaterialCommunityIcons name="send" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>

            <StudentDetailsModal
                visible={detailsModalVisible}
                student={partnerDetails}
                onClose={() => setDetailsModalVisible(false)}
                onEdit={handleEditStudent}
                onDelete={handleDeleteStudent}
                viewMode="full"
            />
        </View>
    );
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingBottom: 20,
        paddingHorizontal: 16,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: "#2563EB",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 8,
        zIndex: 10,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    backBtn: {
        width: 44,
        height: 44,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerProfile: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    headerAvatarText: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1e3c72',
    },
    onlineDot: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#4ADE80', // Green
        borderWidth: 2,
        borderColor: '#fff',
    },
    headerName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 0.5,
    },
    headerStatus: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 2,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    messageRow: {
        flexDirection: 'row',
        width: '100%',
        alignItems: 'flex-end',
    },
    myMessageRow: {
        justifyContent: 'flex-end',
    },
    otherMessageRow: {
        justifyContent: 'flex-start',
    },
    messageAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#E2E8F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    avatarLetter: {
        fontSize: 14,
        fontWeight: '700',
        color: '#64748B',
    },
    dateSeparator: {
        alignItems: 'center',
        marginVertical: 16,
    },
    dateText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#94A3B8',
        backgroundColor: 'rgba(241, 245, 249, 0.5)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        overflow: 'hidden',
    },
    bubble: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
        maxWidth: '75%',
        minWidth: 80,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    myBubble: {
        // Handled in inline style for theme dynamic
    },
    otherBubble: {
        // Handled inline
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
    },
    timeText: {
        fontSize: 10,
        fontWeight: '500',
    },

    // Input Bar
    inputWrapper: {
        paddingHorizontal: 16,
        paddingTop: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 8,
        borderRadius: 30, // Pill shape
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    input: {
        flex: 1,
        fontSize: 16,
        maxHeight: 100,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    sendBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
