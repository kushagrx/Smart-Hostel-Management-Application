import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

interface Props {
    children?: React.ReactNode;
    style?: any; // Allow ViewStyle or array of ViewStyles
}

export default function AnimatedGradientHeader({ children, style }: Props) {
    const opacity = useSharedValue(0);

    useEffect(() => {
        opacity.value = withRepeat(
            withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
            -1, // Infinite
            true // Reverse
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
        };
    });

    const flatStyle = StyleSheet.flatten(style || {});
    const { borderBottomLeftRadius, borderBottomRightRadius, borderRadius, borderBottomStartRadius, borderBottomEndRadius } = flatStyle;
    const radiusStyle = {
        borderBottomLeftRadius,
        borderBottomRightRadius,
        borderRadius,
        borderBottomStartRadius,
        borderBottomEndRadius
    };

    return (
        <View style={[styles.container, style, { overflow: 'visible' }]}>
            {/* Base Gradient - Deep Blue */}
            <LinearGradient
                colors={['#000428', '#004e92']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[StyleSheet.absoluteFill, radiusStyle]}
            />

            {/* Overlay Gradient - Slightly Brighter/Teal-shifted for pulse */}
            <Animated.View style={[StyleSheet.absoluteFill, animatedStyle, radiusStyle, { overflow: 'hidden' }]}>
                {/* Note: View needs radius + overflow hidden to clip inner gradient if needed, 
                   but here we just apply radius to View. 
                   Actually, LinearGradient needs the radius. Animated.View wraps it. 
                   Let's apply radius to Inner Linear Gradient too or just the Animated View? 
                   Applying to Animated View works if we set overflow hidden on IT. 
                   But we want the main container overflow VISIBLE.
               */}
                <LinearGradient
                    colors={['#021b79', '#0575d6']}
                    start={{ x: 0.1, y: 0.1 }}
                    end={{ x: 0.9, y: 0.9 }}
                    style={[StyleSheet.absoluteFill, radiusStyle]}
                />
            </Animated.View>

            {/* Content */}
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        zIndex: 100, // Ensure header is above content
    },
    content: {
        zIndex: 10,
    }
});
