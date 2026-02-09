
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    LayoutAnimation,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    UIManager,
    View
} from 'react-native';
import { Directions, Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import InputField from '../../components/InputField';
import { useAlert } from '../../context/AlertContext';
import { useTheme } from '../../utils/ThemeContext';
import { isAdmin, useUser } from '../../utils/authUtils';
import { DayMenu, initializeDay, MenuItem, MessTimings, subscribeToMenu, updateDayMenu, WeekMenu } from '../../utils/messSyncUtils';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEALS = ['breakfast', 'lunch', 'snacks', 'dinner'];

export default function ManageMessMenuPage() {
    const { colors, theme } = useTheme();
    const insets = useSafeAreaInsets();
    const user = useUser();
    const router = useRouter();
    const { showAlert } = useAlert();

    const [fullMenu, setFullMenu] = useState<WeekMenu>({});
    const [selectedDay, setSelectedDay] = useState<string>('Monday');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Local state for editing the currently selected day
    const [currentDayMenu, setCurrentDayMenu] = useState<DayMenu>({
        day: 'Monday',
        breakfast: [],
        lunch: [],
        snacks: [],
        dinner: []
    });

    // Timings State
    const [timingsModalVisible, setTimingsModalVisible] = useState(false);
    const [timings, setTimings] = useState<MessTimings>({
        breakfast: '', lunch: '', snacks: '', dinner: ''
    });
    const [savingTimings, setSavingTimings] = useState(false);
    const dayScrollRef = React.useRef<ScrollView>(null);

    useEffect(() => {
        if (Platform.OS === 'android') {
            if (UIManager.setLayoutAnimationEnabledExperimental) {
                UIManager.setLayoutAnimationEnabledExperimental(true);
            }
        }
    }, []);

    useEffect(() => {
        if (dayScrollRef.current) {
            const index = DAYS.indexOf(selectedDay);
            dayScrollRef.current.scrollTo({ x: index * 90, animated: true });
        }
    }, [selectedDay]);

    const changeDay = (direction: number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

        const currentIndex = DAYS.indexOf(selectedDay);
        let nextIndex = currentIndex + direction;
        if (nextIndex < 0) nextIndex = DAYS.length - 1;
        if (nextIndex >= DAYS.length) nextIndex = 0;
        setSelectedDay(DAYS[nextIndex]);
    };

    const swipeGestures = React.useMemo(() => {
        const left = Gesture.Fling().direction(Directions.LEFT).onEnd(() => runOnJS(changeDay)(1));
        const right = Gesture.Fling().direction(Directions.RIGHT).onEnd(() => runOnJS(changeDay)(-1));
        return Gesture.Race(left, right);
    }, [selectedDay]);

    useEffect(() => {
        if (!isAdmin(user)) return;

        // Subscribe to updates
        const unsubscribe = subscribeToMenu((data) => {
            setFullMenu(data);
            if (loading) setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    // When selected day changes or fullMenu updates, sync local state
    useEffect(() => {
        if (fullMenu[selectedDay]) {
            const menu = JSON.parse(JSON.stringify(fullMenu[selectedDay]));
            setCurrentDayMenu(menu);
            // Sync timings state with the selected day's timings
            if (menu.timings) {
                setTimings(menu.timings);
            } else {
                setTimings({ breakfast: '', lunch: '', snacks: '', dinner: '' });
            }
        } else {
            // Initialize if missing locally (and trigger DB init)
            initializeDay(selectedDay);
            setCurrentDayMenu({
                day: selectedDay,
                breakfast: [],
                lunch: [],
                snacks: [],
                dinner: [],
                timings: { breakfast: '8:00 - 9:30 AM', lunch: '12:30 - 2:30 PM', snacks: '5:30 - 6:30 PM', dinner: '8:30 - 9:30 PM' }
            });
            setTimings({ breakfast: '8:00 - 9:30 AM', lunch: '12:30 - 2:30 PM', snacks: '5:30 - 6:30 PM', dinner: '8:30 - 9:30 PM' });
        }
    }, [selectedDay, fullMenu]);

    const handleAddItem = (mealType: string) => {
        const updatedMenu = { ...currentDayMenu };
        // @ts-ignore
        updatedMenu[mealType].push({ dish: '', type: 'veg', highlight: false });
        setCurrentDayMenu(updatedMenu);
    };

    const handleUpdateItem = (mealType: string, index: number, field: keyof MenuItem, value: any) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        const updatedMenu = { ...currentDayMenu };
        // @ts-ignore
        updatedMenu[mealType][index][field] = value;
        setCurrentDayMenu(updatedMenu);
    };

    const handleDeleteItem = (mealType: string, index: number) => {
        const updatedMenu = { ...currentDayMenu };
        // @ts-ignore
        updatedMenu[mealType].splice(index, 1);
        setCurrentDayMenu(updatedMenu);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Filter out empty items
            const cleanData = {
                breakfast: currentDayMenu.breakfast.filter(i => i.dish.trim()),
                lunch: currentDayMenu.lunch.filter(i => i.dish.trim()),
                snacks: currentDayMenu.snacks.filter(i => i.dish.trim()),
                dinner: currentDayMenu.dinner.filter(i => i.dish.trim()),
            };

            await updateDayMenu(selectedDay, cleanData);
            showAlert("Success", `${selectedDay}'s menu updated successfully!`);
        } catch (error) {
            console.error(error);
            showAlert("Error", "Failed to save menu");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveTimings = async () => {
        setSavingTimings(true);
        try {
            // Update only the timings field for the current day
            await updateDayMenu(selectedDay, { ...currentDayMenu, timings });
            setTimingsModalVisible(false);
            showAlert("Success", `${selectedDay}'s timings updated!`);
        } catch (error) {
            console.error(error);
            showAlert("Error", "Failed to update timings");
        } finally {
            setSavingTimings(false);
        }
    };

    const styles = React.useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            paddingVertical: 24,
            paddingHorizontal: 24,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        backBtn: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(255,255,255,0.2)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        headerContent: {
            flex: 1,
        },
        headerTitle: {
            fontSize: 22,
            fontWeight: '800',
            color: '#fff',
            letterSpacing: 0.5,
        },
        daySelector: {
            maxHeight: 60,
            marginBottom: 10,
        },
        daySelectorContent: {
            paddingHorizontal: 20,
            paddingVertical: 10,
            gap: 8,
        },
        dayBtn: {
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 24,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            minWidth: 70,
            alignItems: 'center',
        },
        dayBtnSelected: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
        },
        dayBtnText: {
            color: colors.textSecondary,
            fontWeight: '600',
            fontSize: 13,
        },
        dayBtnTextSelected: {
            color: '#fff',
            fontWeight: '700',
        },
        editorScroll: {
            flex: 1,
            padding: 20,
        },
        mealSection: {
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 16,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: colors.border,
        },
        mealHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
        },
        mealTitle: {
            fontSize: 18,
            fontWeight: '700',
            color: colors.text,
            textTransform: 'capitalize',
        },
        addItemBtn: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 6,
            gap: 4,
        },
        addItemText: {
            color: colors.primary,
            fontWeight: '600',
            fontSize: 13,
        },
        itemRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginBottom: 12,
        },
        itemInput: {
            flex: 1,
            height: 44,
            backgroundColor: colors.background,
            borderRadius: 8,
            paddingHorizontal: 12,
            borderWidth: 1,
            borderColor: colors.border,
            color: colors.text,
        },
        typeToggle: {
            width: 36,
            height: 36,
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border,
        },
        deleteBtn: {
            width: 36,
            height: 36,
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.2)' : '#FEF2F2',
        },
        saveBtn: {
            backgroundColor: colors.primary,
            margin: 20,
            paddingVertical: 16,
            borderRadius: 16,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 10,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
        },
        saveBtnText: {
            color: '#fff',
            fontSize: 18,
            fontWeight: '700',
        },

        timingBtn: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(255,255,255,0.2)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
        },
        modalContent: {
            backgroundColor: colors.card,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: '700',
            color: colors.text,
        },
        label: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.textSecondary,
            marginBottom: 8,
            marginTop: 16,
        },
        currentDayTitle: {
            fontSize: 20,
            fontWeight: '700',
            color: colors.text,
            marginBottom: 16,
            marginLeft: 4,
        },
    }), [colors, theme]);

    if (!isAdmin(user)) return null;

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#000428', '#004e92']} style={[styles.header, { paddingTop: 24 + insets.top }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="chevron-left" size={32} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Manage Mess Menu</Text>
                </View>
                <TouchableOpacity onPress={() => setTimingsModalVisible(true)} style={styles.timingBtn}>
                    <MaterialCommunityIcons name="clock-edit-outline" size={24} color="#fff" />
                </TouchableOpacity>
            </LinearGradient>

            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
            ) : (
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                >
                    <View style={styles.daySelector}>
                        <ScrollView
                            ref={dayScrollRef}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.daySelectorContent}
                        >
                            {DAYS.map(day => (
                                <TouchableOpacity
                                    key={day}
                                    style={[styles.dayBtn, selectedDay === day && styles.dayBtnSelected]}
                                    onPress={() => setSelectedDay(day)}
                                >
                                    <Text style={[styles.dayBtnText, selectedDay === day && styles.dayBtnTextSelected]}>
                                        {day.slice(0, 3)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <GestureDetector gesture={swipeGestures}>
                        <ScrollView
                            style={styles.editorScroll}
                            contentContainerStyle={{ paddingBottom: 100 }}
                            keyboardShouldPersistTaps="handled"
                        >
                            <Text style={styles.currentDayTitle}>{selectedDay}'s Menu</Text>
                            {MEALS.map(meal => {
                                // @ts-ignore
                                const items: MenuItem[] = currentDayMenu[meal] || [];

                                return (
                                    <View key={meal} style={styles.mealSection}>
                                        <View style={styles.mealHeader}>
                                            <Text style={styles.mealTitle}>{meal}</Text>
                                            <TouchableOpacity onPress={() => handleAddItem(meal)} style={styles.addItemBtn}>
                                                <MaterialCommunityIcons name="plus-circle" size={18} color={colors.primary} />
                                                <Text style={styles.addItemText}>Add Item</Text>
                                            </TouchableOpacity>
                                        </View>

                                        {items.length === 0 ? (
                                            <Text style={{ color: colors.textSecondary, fontStyle: 'italic', fontSize: 13 }}>No items added yet.</Text>
                                        ) : (
                                            items.map((item, idx) => (
                                                <View key={idx} style={styles.itemRow}>
                                                    <TextInput
                                                        style={styles.itemInput}
                                                        placeholder="Dish Name"
                                                        placeholderTextColor={colors.textSecondary}
                                                        value={item.dish}
                                                        onChangeText={(text) => handleUpdateItem(meal, idx, 'dish', text)}
                                                    />

                                                    {/* Veg/Non-Veg Toggle */}
                                                    <TouchableOpacity
                                                        style={[styles.typeToggle, { borderColor: item.type === 'veg' ? '#10B981' : '#EF4444' }]}
                                                        onPress={() => handleUpdateItem(meal, idx, 'type', item.type === 'veg' ? 'non-veg' : 'veg')}
                                                    >
                                                        <MaterialCommunityIcons
                                                            name="circle-slice-8"
                                                            size={16}
                                                            color={item.type === 'veg' ? '#10B981' : '#EF4444'}
                                                        />
                                                    </TouchableOpacity>

                                                    {/* Highlight/Star Toggle */}
                                                    <TouchableOpacity
                                                        style={[styles.typeToggle, item.highlight && { backgroundColor: theme === 'dark' ? 'rgba(245, 158, 11, 0.2)' : '#FFFBEB', borderColor: '#F59E0B' }]}
                                                        onPress={() => handleUpdateItem(meal, idx, 'highlight', !item.highlight)}
                                                    >
                                                        <MaterialCommunityIcons
                                                            name={item.highlight ? "star" : "star-outline"}
                                                            size={18}
                                                            color={item.highlight ? "#F59E0B" : colors.textSecondary}
                                                        />
                                                    </TouchableOpacity>

                                                    <TouchableOpacity onPress={() => handleDeleteItem(meal, idx)} style={styles.deleteBtn}>
                                                        <MaterialCommunityIcons name="minus" size={18} color="#EF4444" />
                                                    </TouchableOpacity>
                                                </View>
                                            ))
                                        )}
                                    </View>
                                );
                            })}
                        </ScrollView>
                    </GestureDetector>

                    <TouchableOpacity
                        style={[styles.saveBtn, saving && { opacity: 0.7 }]}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <MaterialCommunityIcons name="content-save" size={24} color="#fff" />
                                <Text style={styles.saveBtnText}>Save {selectedDay}'s Menu</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            )}

            {/* Timings Modal */}
            <Modal
                visible={timingsModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setTimingsModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={{ flex: 1, justifyContent: 'flex-end' }}
                    >
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Update {selectedDay}'s Timings</Text>
                                <TouchableOpacity onPress={() => setTimingsModalVisible(false)}>
                                    <MaterialCommunityIcons name="close" size={24} color={colors.text} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={{ maxHeight: 500 }}>
                                {MEALS.map((meal) => (
                                    <View key={meal}>
                                        <Text style={styles.label}>{meal.charAt(0).toUpperCase() + meal.slice(1)} Time</Text>
                                        <InputField
                                            icon="clock-time-four-outline"
                                            placeholder="e.g. 08:00 - 09:30 AM"
                                            // @ts-ignore
                                            value={timings[meal]}
                                            // @ts-ignore
                                            onChangeText={(text) => setTimings({ ...timings, [meal]: text })}
                                        />
                                    </View>
                                ))}
                            </ScrollView>

                            <TouchableOpacity
                                style={[styles.saveBtn, savingTimings && { opacity: 0.7 }, { marginHorizontal: 0, marginTop: 24 }]}
                                onPress={handleSaveTimings}
                                disabled={savingTimings}
                            >
                                {savingTimings ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.saveBtnText}>Save Timings</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </View>
    );
}
