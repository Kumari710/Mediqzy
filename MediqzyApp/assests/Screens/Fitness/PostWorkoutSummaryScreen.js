import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Animated,
    Dimensions,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const COLORS = {
    primary: '#23238E',
    secondary: '#6B6BE8',
    white: '#FFFFFF',
    text: '#1A1A2E',
    textSecondary: '#64748B',
    success: '#10B981',
};

export default function PostWorkoutSummaryScreen({ navigation, route }) {
    const { type, duration, distance, calories, pace } = route.params || {};

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 5,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            {/* Top Section with Gradient background */}
            <View style={styles.topSection}>
                <LinearGradient
                    colors={[COLORS.primary, '#3B3B98']}
                    style={styles.gradientBg}
                >
                    <SafeAreaView style={styles.safeArea}>
                        <View style={styles.header}>
                            <Text style={styles.headerTitle}>Workout Summary</Text>
                        </View>

                        <Animated.View style={[styles.mainHero, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                            <View style={styles.iconCircle}>
                                <Ionicons
                                    name={type === 'Yoga' ? 'body' : type === 'Cycling' ? 'bicycle' : 'walk'}
                                    size={moderateScale(50)}
                                    color={COLORS.white}
                                />
                            </View>
                            <Text style={styles.heroSubTitle}>Greate Job!</Text>
                            <Text style={styles.heroTitle}>{type} Session Completed</Text>
                        </Animated.View>
                    </SafeAreaView>
                </LinearGradient>
            </View>

            {/* Stats Section */}
            <Animated.View style={[styles.bottomSection, { transform: [{ translateY: slideAnim }] }]}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                    <View style={styles.summaryGrid}>
                        <SummaryItem
                            label="DURATION"
                            value={formatTime(duration || 0)}
                            icon="time-outline"
                            color="#5856D6"
                        />
                        <SummaryItem
                            label="CALORIES"
                            value={`${Math.round(calories || 0)} kcal`}
                            icon="flame-outline"
                            color="#FF3B30"
                        />
                        {distance !== undefined && (
                            <SummaryItem
                                label="DISTANCE"
                                value={`${parseFloat(distance || 0).toFixed(2)} km`}
                                icon="navigate-outline"
                                color="#007AFF"
                            />
                        )}
                        {pace !== undefined && (
                            <SummaryItem
                                label="AVG. PACE"
                                value={`${parseFloat(pace || 0).toFixed(1)} /km`}
                                icon="speedometer-outline"
                                color="#FF9500"
                            />
                        )}
                    </View>

                    {/* Motivational Quote */}
                    <View style={styles.quoteCard}>
                        <Ionicons name="ribbon-outline" size={32} color={COLORS.primary} />
                        <Text style={styles.quoteText}>
                            "Every workout is a step closer to a healthier version of you. Keep pushing!"
                        </Text>
                    </View>

                    <View style={{ height: hp(15) }} />
                </ScrollView>

                {/* Buttons */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.doneBtn}
                        onPress={() => navigation.navigate('HomeScreen')}
                    >
                        <Text style={styles.doneBtnText}>Back to Home</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
}

const SummaryItem = ({ label, value, icon, color }) => (
    <View style={styles.statCard}>
        <View style={[styles.statIconBox, { backgroundColor: `${color}15` }]}>
            <Ionicons name={icon} size={moderateScale(24)} color={color} />
        </View>
        <View style={styles.statInfo}>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={styles.statValue}>{value}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    topSection: {
        height: hp(45),
        width: '100%',
    },
    gradientBg: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
        alignItems: 'center',
    },
    header: {
        marginTop: verticalScale(10),
        paddingVertical: hp(2),
    },
    headerTitle: {
        fontSize: moderateScale(18),
        fontWeight: '700',
        color: COLORS.white,
        letterSpacing: 1,
    },
    mainHero: {
        alignItems: 'center',
        marginTop: hp(2),
    },
    iconCircle: {
        width: scale(100),
        height: scale(100),
        borderRadius: scale(50),
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        marginBottom: hp(3),
    },
    heroSubTitle: {
        fontSize: moderateScale(16),
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '600',
        letterSpacing: 1,
        marginBottom: verticalScale(8),
    },
    heroTitle: {
        fontSize: moderateScale(26),
        color: COLORS.white,
        fontWeight: '800',
        textAlign: 'center',
        paddingHorizontal: wp(10),
    },
    bottomSection: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        borderTopLeftRadius: scale(35),
        borderTopRightRadius: scale(35),
        marginTop: -hp(5),
        paddingTop: hp(4),
    },
    scrollContent: {
        paddingHorizontal: wp(6),
    },
    summaryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    statCard: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        borderRadius: scale(20),
        padding: scale(16),
        marginBottom: verticalScale(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    statIconBox: {
        width: scale(44),
        height: scale(44),
        borderRadius: scale(12),
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: verticalScale(12),
    },
    statInfo: {
        gap: verticalScale(4),
    },
    statLabel: {
        fontSize: moderateScale(11),
        fontWeight: '700',
        color: COLORS.textSecondary,
        letterSpacing: 0.5,
    },
    statValue: {
        fontSize: moderateScale(18),
        fontWeight: '800',
        color: COLORS.text,
    },
    quoteCard: {
        backgroundColor: '#EBF0FF',
        borderRadius: scale(24),
        padding: scale(24),
        alignItems: 'center',
        marginTop: hp(2),
        borderWidth: 1,
        borderColor: 'rgba(35, 35, 142, 0.1)',
    },
    quoteText: {
        fontSize: moderateScale(14),
        color: COLORS.primary,
        fontStyle: 'italic',
        textAlign: 'center',
        fontWeight: '600',
        marginTop: verticalScale(12),
        lineHeight: moderateScale(20),
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: wp(6),
        backgroundColor: 'rgba(248, 250, 252, 0.9)',
    },
    doneBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: scale(30),
        paddingVertical: hp(2),
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 6,
    },
    doneBtnText: {
        color: COLORS.white,
        fontSize: moderateScale(16),
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});
