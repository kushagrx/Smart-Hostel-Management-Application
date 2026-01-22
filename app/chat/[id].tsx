import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'; // Added LinearGradient
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
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

import { isAdmin, useUser } from '../../utils/authUtils';
import { ChatMessage, sendMessage, subscribeToMessages } from '../../utils/chatUtils';
import { useTheme } from '../../utils/ThemeContext';

export default function ChatScreen() {
    const { id, name } = useLocalSearchParams<{ id: string, name?: string }>();
    const router = useRouter();
    const { colors, theme } = useTheme();
    const insets = useSafeAreaInsets();
    const user = useUser();

    // Determine current user role/id
    const isUserAdmin = isAdmin(user);
    const currentUserId = isUserAdmin ? 'admin' : ((user as any)?.uid || (user as any)?.id || 'student');
    const currentUserName = isUserAdmin ? 'Admin' : ((user as any)?.displayName || (user as any)?.name || 'Student');

    // Determine Chat Title
    // If Admin -> Show Student Name (passed via params)
    // If Student -> Show "Admin Support"
    const chatTitle = name || (isUserAdmin ? 'Student Chat' : 'Admin Support');

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        if (!id) return;
        const unsubscribe = subscribeToMessages(id, (newMessages) => {
            setMessages(newMessages);
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

    const renderMessage = ({ item, index }: { item: ChatMessage, index: number }) => {
        const isMe = item.user._id === currentUserId;
        const isContinuous = index < messages.length - 1 && messages[index + 1].user._id === item.user._id;

        return (
            <View style={[
                styles.messageRow,
                isMe ? styles.myMessageRow : styles.otherMessageRow,
                isContinuous ? { marginBottom: 4 } : { marginBottom: 16 }
            ]}>
                {/* Avatar for 'Other' user only */}
                {!isMe && !isContinuous && (
                    <View style={styles.messageAvatar}>
                        <Text style={styles.avatarLetter}>{chatTitle.charAt(0)}</Text>
                    </View>
                )}
                {!isMe && isContinuous && <View style={{ width: 32, marginRight: 8 }} />}

                <View style={[
                    styles.bubble,
                    isMe ? styles.myBubble : styles.otherBubble,
                    {
                        backgroundColor: isMe ? colors.primary : (theme === 'dark' ? '#1E293B' : '#FFFFFF'),
                        borderColor: isMe ? colors.primary : (theme === 'dark' ? '#334155' : '#E2E8F0'),
                        borderWidth: 1,
                    }
                ]}>
                    <Text style={[
                        styles.messageText,
                        { color: isMe ? '#fff' : (theme === 'dark' ? '#F1F5F9' : '#1E293B') }
                    ]}>
                        {item.text}
                    </Text>
                    <View style={styles.metaContainer}>
                        <Text style={[
                            styles.timeText,
                            { color: isMe ? 'rgba(255,255,255,0.7)' : '#94A3B8' }
                        ]}>
                            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </Text>
                        {isMe && (
                            <Ionicons name="checkmark-done" size={14} color="rgba(255,255,255,0.7)" style={{ marginLeft: 4 }} />
                        )}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Royal Blue Header */}
            <LinearGradient
                colors={['#000428', '#004e92']}
                style={[styles.header, { paddingTop: insets.top + 10 }]}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <MaterialCommunityIcons name="arrow-left" size={28} color="#fff" />
                    </TouchableOpacity>

                    <View style={styles.headerProfile}>
                        <View style={styles.headerAvatar}>
                            <Text style={styles.headerAvatarText}>{chatTitle.charAt(0).toUpperCase()}</Text>
                        </View>
                        <View>
                            <Text style={styles.headerName}>{chatTitle}</Text>
                            <Text style={styles.headerStatus}>Online</Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>

            {/* Chat Area */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={item => item._id}
                    inverted
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20, paddingTop: 24 }}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Input Area */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={[styles.inputContainer, {
                    paddingBottom: Math.max(insets.bottom, 16),
                    backgroundColor: theme === 'dark' ? '#0F172A' : '#fff',
                    borderColor: theme === 'dark' ? '#1E293B' : '#E2E8F0',
                }]}>
                    <View style={[styles.inputFieldContainer, {
                        backgroundColor: theme === 'dark' ? '#1E293B' : '#F8FAFC',
                        borderColor: theme === 'dark' ? '#334155' : '#E2E8F0',
                    }]}>
                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="Type a message..."
                            placeholderTextColor={colors.textSecondary}
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                            maxLength={500}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.sendBtn, {
                            backgroundColor: inputText.length > 0 ? colors.primary : '#94A3B8',
                            shadowColor: colors.primary,
                        }]}
                        onPress={handleSend}
                        disabled={inputText.length === 0}
                    >
                        <MaterialCommunityIcons name="send" size={24} color="#fff" style={{ marginLeft: 2 }} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        zIndex: 10,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    backBtn: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerProfile: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 14,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerAvatarText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#004e92',
    },
    headerName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
    },
    headerStatus: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '500',
    },

    // Chat Area
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
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: '#E2E8F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        marginBottom: 4, // Align with bottom of bubble
    },
    avatarLetter: {
        fontSize: 14,
        fontWeight: '700',
        color: '#64748B',
    },
    bubble: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
        maxWidth: '75%',
        minWidth: 80,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    myBubble: {
        borderBottomRightRadius: 4,
    },
    otherBubble: {
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
    },
    metaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 4,
        gap: 4,
    },
    timeText: {
        fontSize: 10,
        fontWeight: '500',
    },

    // Input Bar
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 20,
        paddingTop: 16,
        borderTopWidth: 1,
    },
    inputFieldContainer: {
        flex: 1,
        borderRadius: 24,
        minHeight: 48,
        marginRight: 12,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderWidth: 1,
    },
    input: {
        fontSize: 16,
        maxHeight: 100,
        padding: 0, // Remove default padding
    },
    sendBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
});
