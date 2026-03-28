import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    TextInput,
    Animated,
    Easing,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Svg, { Circle, G, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

const { width } = Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Theme colors
const THEME = {
    primary: '#7C3AED',
    primaryDark: '#6D28D9',
    primaryLight: '#EDE9FE',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: '#1E293B',
    textSecondary: '#64748B',
};

const BMIScreen = ({ navigation }) => {
    const [height, setHeight] = useState('170');
    const [weight, setWeight] = useState('65');

    // Animation refs
    const progressAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const cardAnims = useRef(new Array(4).fill(0).map(() => new Animated.Value(0))).current;
    const scaleIndicatorAnim = useRef(new Animated.Value(0)).current;

    // Calculate BMI
    const calculateBMI = () => {
        const h = parseFloat(height) / 100;
        const w = parseFloat(weight);
        if (h > 0 && w > 0) {
            return (w / (h * h)).toFixed(1);
        }
        return 0;
    };

    const bmi = calculateBMI();

    // BMI Category
    const getBMICategory = (bmiValue) => {
        const val = parseFloat(bmiValue);
        if (val < 18.5) return { text: 'Underweight', color: '#3498DB', icon: 'arrow-down', advice: 'Consider increasing caloric intake with nutritious foods.' };
        if (val < 25) return { text: 'Normal', color: '#27AE60', icon: 'checkmark-circle', advice: 'Great job! Maintain your healthy lifestyle.' };
        if (val < 30) return { text: 'Overweight', color: '#F59E0B', icon: 'warning', advice: 'Consider increasing physical activity and balanced diet.' };
        return { text: 'Obese', color: '#E74C3C', icon: 'alert-circle', advice: 'Consult a healthcare provider for personalized advice.' };
    };

    const category = getBMICategory(bmi);

    // BMI Scale position (0-100%)
    const getScalePosition = () => {
        const val = parseFloat(bmi);
        if (val < 15) return 0;
        if (val > 35) return 100;
        return ((val - 15) / 20) * 100;
    };

    const history = [
        { date: 'Jan 8', bmi: 22.5, weight: 65, change: -0.3 },
        { date: 'Jan 1', bmi: 22.8, weight: 66, change: -0.3 },
        { date: 'Dec 25', bmi: 23.1, weight: 67, change: +0.2 },
        { date: 'Dec 18', bmi: 22.9, weight: 66.5, change: -0.1 },
    ];

    useEffect(() => {
        startAnimations();
    }, [bmi]);

    const startAnimations = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.timing(progressAnim, {
                toValue: Math.min(parseFloat(bmi) / 40, 1) * 100,
                duration: 1500,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
            }),
            Animated.timing(scaleIndicatorAnim, {
                toValue: getScalePosition(),
                duration: 1200,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
            }),
        ]).start();

        cardAnims.forEach((anim, index) => {
            Animated.timing(anim, {
                toValue: 1,
                duration: 400,
                delay: 600 + index * 80,
                easing: Easing.out(Easing.back(1.2)),
                useNativeDriver: true,
            }).start();
        });
    };

    // BMI Gauge Component
    const BMIGauge = ({ size = scale(180), strokeWidth = scale(14) }) => {
        const radius = (size - strokeWidth) / 2;
        const circumference = radius * 2 * Math.PI;

        const strokeDashoffset = progressAnim.interpolate({
            inputRange: [0, 100],
            outputRange: [circumference, 0],
        });

        return (
            <Animated.View style={{ alignItems: 'center', opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
                <Svg width={size} height={size}>
                    <Defs>
                        <LinearGradient id="bmiGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <Stop offset="0%" stopColor="#3498DB" />
                            <Stop offset="33%" stopColor="#27AE60" />
                            <Stop offset="66%" stopColor="#F59E0B" />
                            <Stop offset="100%" stopColor="#E74C3C" />
                        </LinearGradient>
                    </Defs>
                    <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
                        <Circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke="#F1F5F9"
                            strokeWidth={strokeWidth}
                            fill="transparent"
                        />
                        <AnimatedCircle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke="url(#bmiGradient)"
                            strokeWidth={strokeWidth}
                            fill="transparent"
                            strokeDasharray={`${circumference} ${circumference}`}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                        />
                    </G>
                </Svg>
                <View style={styles.gaugeContent}>
                    <Text style={[styles.bmiValue, { color: category.color }]}>{bmi}</Text>
                    <Text style={styles.bmiLabel}>BMI</Text>
                </View>
            </Animated.View>
        );
    };

    // BMI Scale Component
    const BMIScale = () => {
        const indicatorPosition = scaleIndicatorAnim.interpolate({
            inputRange: [0, 100],
            outputRange: ['0%', '100%'],
        });

        return (
            <View style={styles.scaleContainer}>
                <View style={styles.scale}>
                    <View style={[styles.scaleSection, { backgroundColor: '#3498DB', flex: 1 }]} />
                    <View style={[styles.scaleSection, { backgroundColor: '#27AE60', flex: 2 }]} />
                    <View style={[styles.scaleSection, { backgroundColor: '#F59E0B', flex: 1.5 }]} />
                    <View style={[styles.scaleSection, { backgroundColor: '#E74C3C', flex: 1.5 }]} />
                </View>
                <Animated.View style={[styles.scaleIndicator, { left: indicatorPosition }]}>
                    <View style={[styles.indicatorDot, { backgroundColor: category.color }]} />
                </Animated.View>
                <View style={styles.scaleLabels}>
                    <Text style={styles.scaleLabel}>15</Text>
                    <Text style={styles.scaleLabel}>18.5</Text>
                    <Text style={styles.scaleLabel}>25</Text>
                    <Text style={styles.scaleLabel}>30</Text>
                    <Text style={styles.scaleLabel}>35</Text>
                </View>
                <View style={styles.scaleCategoryLabels}>
                    <Text style={[styles.scaleCategoryLabel, { color: '#3498DB' }]}>Under</Text>
                    <Text style={[styles.scaleCategoryLabel, { color: '#27AE60' }]}>Normal</Text>
                    <Text style={[styles.scaleCategoryLabel, { color: '#F59E0B' }]}>Over</Text>
                    <Text style={[styles.scaleCategoryLabel, { color: '#E74C3C' }]}>Obese</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={THEME.background} />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={moderateScale(24)} color="#1E3A8A" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>BMI Calculator</Text>
                    <TouchableOpacity style={styles.menuButton}>
                        <Ionicons name="information-circle-outline" size={moderateScale(22)} color="#1E3A8A" />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* BMI Display */}
                    <View style={styles.bmiDisplay}>
                        <BMIGauge />
                        <View style={[styles.categoryBadge, { backgroundColor: `${category.color}15` }]}>
                            <Ionicons name={category.icon} size={moderateScale(16)} color={category.color} />
                            <Text style={[styles.categoryText, { color: category.color }]}>{category.text}</Text>
                        </View>
                    </View>

                    {/* BMI Scale */}
                    <BMIScale />

                    {/* Input Section */}
                    <View style={styles.inputSection}>
                        <View style={styles.inputRow}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Height</Text>
                                <View style={styles.inputWrapper}>
                                    <Ionicons name="resize-outline" size={scale(20)} color={THEME.primary} />
                                    <TextInput
                                        style={styles.input}
                                        value={height}
                                        onChangeText={setHeight}
                                        keyboardType="numeric"
                                        placeholder="170"
                                    />
                                    <Text style={styles.inputUnit}>cm</Text>
                                </View>
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Weight</Text>
                                <View style={styles.inputWrapper}>
                                    <Ionicons name="scale-outline" size={scale(20)} color={THEME.primary} />
                                    <TextInput
                                        style={styles.input}
                                        value={weight}
                                        onChangeText={setWeight}
                                        keyboardType="numeric"
                                        placeholder="65"
                                    />
                                    <Text style={styles.inputUnit}>kg</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Ideal Weight Range */}
                    <View style={styles.idealCard}>
                        <View style={styles.idealIcon}>
                            <Ionicons name="checkmark-circle" size={scale(24)} color="#27AE60" />
                        </View>
                        <View style={styles.idealContent}>
                            <Text style={styles.idealLabel}>Ideal Weight Range</Text>
                            <Text style={styles.idealValue}>
                                {(18.5 * Math.pow(parseFloat(height) / 100, 2)).toFixed(1)} - {(24.9 * Math.pow(parseFloat(height) / 100, 2)).toFixed(1)} kg
                            </Text>
                        </View>
                    </View>

                    {/* Advice Card */}
                    <View style={[styles.adviceCard, { borderLeftColor: category.color }]}>
                        <View style={styles.adviceHeader}>
                            <Ionicons name="bulb" size={scale(20)} color={category.color} />
                            <Text style={styles.adviceTitle}>Recommendation</Text>
                        </View>
                        <Text style={styles.adviceText}>{category.advice}</Text>
                    </View>

                    {/* History */}
                    <Text style={styles.sectionTitle}>History</Text>
                    <View style={styles.historyList}>
                        {history.map((item, index) => {
                            const animStyle = {
                                opacity: cardAnims[index],
                                transform: [{
                                    translateY: cardAnims[index].interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [20, 0],
                                    }),
                                }],
                            };

                            return (
                                <Animated.View key={index} style={animStyle}>
                                    <View style={styles.historyItem}>
                                        <View>
                                            <Text style={styles.historyDate}>{item.date}</Text>
                                            <Text style={styles.historyWeight}>{item.weight} kg</Text>
                                        </View>
                                        <View style={styles.historyRight}>
                                            <Text style={[styles.historyBmi, { color: getBMICategory(item.bmi).color }]}>
                                                {item.bmi}
                                            </Text>
                                            <View style={[
                                                styles.changeBadge,
                                                { backgroundColor: item.change < 0 ? '#E8F5E9' : '#FFEBEE' }
                                            ]}>
                                                <Ionicons
                                                    name={item.change < 0 ? 'trending-down' : 'trending-up'}
                                                    size={scale(12)}
                                                    color={item.change < 0 ? '#27AE60' : '#E74C3C'}
                                                />
                                                <Text style={[
                                                    styles.changeText,
                                                    { color: item.change < 0 ? '#27AE60' : '#E74C3C' }
                                                ]}>
                                                    {item.change > 0 ? '+' : ''}{item.change}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </Animated.View>
                            );
                        })}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

export default BMIScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.surface,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: wp(4),
        paddingVertical: hp(1.5),
        backgroundColor: THEME.background,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    backButton: {
        padding: scale(8),
    },
    headerTitle: {
        fontSize: moderateScale(18),
        fontWeight: '700',
        color: '#1E3A8A',
    },
    menuButton: {
        padding: scale(8),
    },
    scrollContent: {
        paddingBottom: hp(4),
    },
    bmiDisplay: {
        alignItems: 'center',
        paddingVertical: hp(3),
    },
    gaugeContent: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    },
    bmiValue: {
        fontSize: moderateScale(48),
        fontWeight: '700',
    },
    bmiLabel: {
        fontSize: moderateScale(16),
        color: THEME.textSecondary,
        fontWeight: '600',
    },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: wp(4),
        paddingVertical: hp(0.8),
        borderRadius: scale(20),
        marginTop: hp(2),
        gap: scale(6),
    },
    categoryText: {
        fontSize: moderateScale(15),
        fontWeight: '600',
    },
    scaleContainer: {
        marginHorizontal: wp(5),
        marginBottom: hp(3),
    },
    scale: {
        flexDirection: 'row',
        height: scale(8),
        borderRadius: scale(4),
        overflow: 'hidden',
    },
    scaleSection: {
        height: '100%',
    },
    scaleIndicator: {
        position: 'absolute',
        top: -scale(4),
        marginLeft: -scale(8),
    },
    indicatorDot: {
        width: scale(16),
        height: scale(16),
        borderRadius: scale(8),
        borderWidth: 3,
        borderColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    scaleLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: hp(1.5),
    },
    scaleLabel: {
        fontSize: moderateScale(11),
        color: THEME.textSecondary,
        fontWeight: '500',
    },
    scaleCategoryLabels: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: hp(0.5),
    },
    scaleCategoryLabel: {
        fontSize: moderateScale(10),
        fontWeight: '600',
    },
    inputSection: {
        backgroundColor: THEME.background,
        marginHorizontal: wp(5),
        borderRadius: scale(20),
        padding: scale(20),
        marginBottom: hp(2),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    inputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    inputGroup: {
        width: '48%',
    },
    inputLabel: {
        fontSize: moderateScale(13),
        color: THEME.textSecondary,
        marginBottom: hp(1),
        fontWeight: '600',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.primaryLight,
        borderRadius: scale(12),
        paddingHorizontal: scale(12),
        paddingVertical: scale(4),
    },
    input: {
        flex: 1,
        fontSize: moderateScale(20),
        fontWeight: '700',
        color: THEME.text,
        paddingVertical: hp(1),
        marginLeft: scale(8),
    },
    inputUnit: {
        fontSize: moderateScale(14),
        color: THEME.primary,
        fontWeight: '600',
    },
    idealCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        marginHorizontal: wp(5),
        borderRadius: scale(16),
        padding: scale(16),
        marginBottom: hp(2),
    },
    idealIcon: {
        width: scale(48),
        height: scale(48),
        borderRadius: scale(24),
        backgroundColor: '#C8E6C9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    idealContent: {
        flex: 1,
        marginLeft: scale(14),
    },
    idealLabel: {
        fontSize: moderateScale(13),
        color: '#2E7D32',
    },
    idealValue: {
        fontSize: moderateScale(18),
        fontWeight: '700',
        color: '#1B5E20',
        marginTop: verticalScale(2),
    },
    adviceCard: {
        backgroundColor: THEME.background,
        marginHorizontal: wp(5),
        borderRadius: scale(16),
        padding: scale(16),
        borderLeftWidth: scale(4),
        marginBottom: hp(2),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    adviceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: hp(1),
        gap: scale(8),
    },
    adviceTitle: {
        fontSize: moderateScale(15),
        fontWeight: '700',
        color: THEME.text,
    },
    adviceText: {
        fontSize: moderateScale(13),
        color: THEME.textSecondary,
        lineHeight: moderateScale(20),
    },
    sectionTitle: {
        fontSize: moderateScale(18),
        fontWeight: '700',
        color: THEME.text,
        paddingHorizontal: wp(5),
        marginBottom: hp(1.5),
    },
    historyList: {
        paddingHorizontal: wp(5),
    },
    historyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: THEME.background,
        borderRadius: scale(16),
        padding: scale(16),
        marginBottom: verticalScale(10),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    historyDate: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: THEME.text,
    },
    historyWeight: {
        fontSize: moderateScale(12),
        color: THEME.textSecondary,
        marginTop: verticalScale(2),
    },
    historyRight: {
        alignItems: 'flex-end',
    },
    historyBmi: {
        fontSize: moderateScale(22),
        fontWeight: '700',
    },
    changeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(8),
        paddingVertical: verticalScale(2),
        borderRadius: scale(8),
        marginTop: verticalScale(4),
        gap: scale(4),
    },
    changeText: {
        fontSize: moderateScale(11),
        fontWeight: '600',
    },
});
