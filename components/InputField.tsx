import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../utils/ThemeContext';

const InputField = React.memo(({
    label,
    icon,
    value,
    onChangeText,
    placeholder,
    keyboardType = 'default',
    required = false,
    hasSubmitted
}: any) => {
    const { colors, theme } = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    const styles = React.useMemo(() => StyleSheet.create({
        inputContainer: {
            marginBottom: 16,
        },
        label: {
            fontSize: 13,
            fontWeight: '600',
            color: colors.textSecondary,
            marginBottom: 8,
            marginLeft: 4,
        },
        inputWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme === 'dark' ? '#1E293B' : '#F8FAFC',
            borderRadius: 16,
            borderWidth: 1.5,
            borderColor: colors.border,
            height: 56,
            paddingHorizontal: 16,
        },
        inputWrapperFocused: {
            borderColor: colors.primary,
            backgroundColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : '#F0F9FF',
        },
        inputIcon: {
            marginRight: 10,
        },
        input: {
            flex: 1,
            fontSize: 15,
            color: colors.text,
            height: '100%',
        },
        errorText: {
            color: '#EF4444',
            fontSize: 12,
            marginTop: 4,
            marginLeft: 4,
        },
    }), [colors, theme]);

    return (
        <View style={styles.inputContainer}>
            <Text style={[
                styles.label,
                isFocused && { color: colors.primary }
            ]}>
                {label} {required && <Text style={{ color: '#EF4444' }}>*</Text>}
            </Text>
            <View style={[
                styles.inputWrapper,
                isFocused && styles.inputWrapperFocused,
                hasSubmitted && required && !value && { borderColor: '#EF4444', borderWidth: 1 }
            ]}>
                <MaterialIcons
                    name={icon}
                    size={20}
                    color={isFocused ? colors.primary : colors.textSecondary}
                    style={styles.inputIcon}
                />
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor="#94A3B8"
                    value={value}
                    onChangeText={onChangeText}
                    keyboardType={keyboardType}
                    autoCapitalize="none"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />
            </View>
            {hasSubmitted && required && !value && (
                <Text style={styles.errorText}>{label} is required</Text>
            )}
        </View>
    );
});



export default InputField;
