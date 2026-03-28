import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Image,
    ActivityIndicator,
    Animated,
    Easing,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import { searchHealthVideos } from '../../Utils/youtubeService';

const { width } = Dimensions.get('window');

const HealthTrackerScreen = ({ navigation }) => {
    const [videos, setVideos] = useState([]);
    const [loadingVideos, setLoadingVideos] = useState(false);

    // Animation refs for staggered entrance
    const cardAnims = useRef(
        new Array(9).fill(0).map(() => new Animated.Value(0))
    ).current;

    useEffect(() => {
        const fetchVideos = async () => {
            setLoadingVideos(true);
            try {
                const tubeVideos = await searchHealthVideos('healthy lifestyle tips');
                setVideos(tubeVideos.slice(0, 4));
            } catch (error) {
                console.log('Error fetching videos:', error);
            }
            setLoadingVideos(false);
        };
        fetchVideos();
        animateCards();
    }, []);

    const animateCards = () => {
        cardAnims.forEach((anim, index) => {
            anim.setValue(0);
            Animated.timing(anim, {
                toValue: 1,
                duration: 400,
                delay: index * 60,
                easing: Easing.out(Easing.back(1.2)),
                useNativeDriver: true,
            }).start();
        });
    };

    // Health metrics data matching the reference design
    const healthMetrics = [
        {
            id: 1,
            name: 'Heart Rate',
            icon: 'heart',
            color: '#E91E63',
            bgColor: '#FFEBEF',
            ringColor: '#FFB6C6',
            screen: 'HeartRateMonitorScreen',
        },
        {
            id: 2,
            name: 'BMI',
            icon: 'body',
            color: '#7C3AED',
            bgColor: '#F3E8FF',
            ringColor: '#DDD6FE',
            screen: 'BMIScreen',
        },
        {
            id: 3,
            name: 'Blood Pressure',
            icon: 'pulse',
            color: '#E91E63',
            bgColor: '#FFF0F3',
            ringColor: '#FECDD3',
            screen: 'BloodPressureScreen',
        },
        {
            id: 4,
            name: 'SpO₂',
            icon: 'fitness-outline',
            color: '#F59E0B',
            bgColor: '#FEF3C7',
            ringColor: '#FDE68A',
            screen: 'SpO2Screen',
        },
        {
            id: 5,
            name: 'HRV',
            icon: 'heart-circle',
            color: '#EC4899',
            bgColor: '#FCE7F3',
            ringColor: '#FBCFE8',
            screen: 'HRVScreen',
        },
        {
            id: 6,
            name: 'Smart health',
            icon: 'phone-portrait',
            color: '#3B82F6',
            bgColor: '#EFF6FF',
            ringColor: '#BFDBFE',
            screen: 'SmartCheckupScreen',
        },
        {
            id: 7,
            name: 'Temperature',
            icon: 'thermometer',
            color: '#EF4444',
            bgColor: '#E0F7F4',
            ringColor: '#A7F3D0',
            screen: 'TemperatureScreen',
        },
        {
            id: 8,
            name: 'Stress',
            icon: 'brain',
            color: '#F97316',
            bgColor: '#FFF7ED',
            ringColor: '#FED7AA',
            screen: 'StressScreen',
        },
        {
            id: 9,
            name: 'Blood Glucose',
            icon: 'water',
            color: '#3B82F6',
            bgColor: '#ECFDF5',
            ringColor: '#A7F3D0',
            screen: 'BloodGlucoseScreen',
        },
    ];

    // Icon with ring background component
    const MetricIcon = ({ icon, color, bgColor, ringColor, size = scale(56) }) => {
        const innerSize = size * 0.65;

        return (
            <View style={[styles.metricIconContainer, { width: size, height: size }]}>
                {/* Outer ring */}
                <View style={[
                    styles.iconOuterRing,
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        borderColor: ringColor,
                    }
                ]} />
                {/* Inner circle with icon */}
                <View style={[
                    styles.iconInnerCircle,
                    {
                        width: innerSize,
                        height: innerSize,
                        borderRadius: innerSize / 2,
                        backgroundColor: bgColor,
                    }
                ]}>
                    <Ionicons
                        name={icon}
                        size={innerSize * 0.5}
                        color={color}
                    />
                </View>
            </View>
        );
    };

    // Health Metric Card Component
    const HealthMetricCard = ({ metric, index }) => {
        const animValue = cardAnims[index];

        const animatedStyle = {
            opacity: animValue,
            transform: [
                {
                    translateY: animValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0],
                    }),
                },
                {
                    scale: animValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.9, 1],
                    }),
                },
            ],
        };

        return (
            <Animated.View style={animatedStyle}>
                <TouchableOpacity
                    style={styles.metricCard}
                    onPress={() => navigation.navigate(metric.screen)}
                    activeOpacity={0.7}
                >
                    <MetricIcon
                        icon={metric.icon}
                        color={metric.color}
                        bgColor={metric.bgColor}
                        ringColor={metric.ringColor}
                    />
                    <Text style={styles.metricName}>{metric.name}</Text>
                    <Ionicons name="chevron-forward" size={moderateScale(20)} color="#CBD5E1" />
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
            <SafeAreaView style={styles.safeArea} edges={['top']}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={moderateScale(24)} color="#1E293B" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Health Tracker</Text>
                    <TouchableOpacity style={styles.addDeviceButton}>
                        <View style={styles.addDeviceIconContainer}>
                            <Ionicons name="add" size={moderateScale(20)} color="#FFFFFF" />
                        </View>
                        <Text style={styles.addDeviceText}>Add Device</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Health Metrics List */}
                    <View style={styles.metricsContainer}>
                        {healthMetrics.map((metric, index) => (
                            <HealthMetricCard
                                key={metric.id}
                                metric={metric}
                                index={index}
                            />
                        ))}
                    </View>

                    {/* Health Education Videos */}
                    {videos.length > 0 && (
                        <>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Health Education</Text>
                                <TouchableOpacity onPress={() => navigation.navigate('HealthEducationScreen')}>
                                    <Text style={styles.seeAllText}>See All</Text>
                                </TouchableOpacity>

                            </View>

                            {loadingVideos ? (
                                <ActivityIndicator size="small" color="#1E3A8A" style={{ marginVertical: 20 }} />
                            ) : (
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.videoScroll}
                                >
                                    {videos.map((video) => (
                                        <TouchableOpacity
                                            key={video.id}
                                            style={styles.videoCard}
                                            onPress={() => navigation.navigate('YouTubePlayer', { videoId: video.videoId })}
                                        >
                                            <Image source={{ uri: video.thumbnail }} style={styles.videoThumb} />
                                            <View style={styles.videoInfo}>
                                                <Text style={styles.videoTitle} numberOfLines={2}>{video.title}</Text>
                                                <View style={styles.playRow}>
                                                    <Ionicons name="play-circle" size={16} color="#3B82F6" />
                                                    <Text style={styles.watchNow}>Watch Now</Text>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            )}
                        </>
                    )}

                    {/* Health Tip */}
                    <View style={styles.tipsCard}>
                        <View style={styles.tipsIconContainer}>
                            <Ionicons name="bulb" size={moderateScale(24)} color="#F59E0B" />
                        </View>
                        <View style={styles.tipsContent}>
                            <Text style={styles.tipsTitle}>Daily Health Tip</Text>
                            <Text style={styles.tipsText}>
                                Stay hydrated! Drink at least 8 glasses of water daily for optimal health.
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

export default HealthTrackerScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
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
        backgroundColor: '#F8FAFC',
    },
    backButton: {
        padding: scale(8),
    },
    headerTitle: {
        fontSize: moderateScale(18),
        fontWeight: '600',
        color: '#1E293B',
    },
    addDeviceButton: {
        alignItems: 'center',
    },
    addDeviceIconContainer: {
        width: scale(36),
        height: scale(36),
        borderRadius: scale(18),
        backgroundColor: '#3B82F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addDeviceText: {
        fontSize: moderateScale(10),
        color: '#64748B',
        marginTop: verticalScale(4),
    },
    scrollContent: {
        paddingBottom: hp(4),
    },
    metricsContainer: {
        paddingHorizontal: wp(4),
        paddingTop: hp(1),
    },
    metricCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: scale(16),
        paddingVertical: verticalScale(12),
        paddingHorizontal: scale(16),
        marginBottom: verticalScale(12),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    metricIconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    iconOuterRing: {
        position: 'absolute',
        borderWidth: scale(2),
        backgroundColor: 'transparent',
    },
    iconInnerCircle: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    metricName: {
        flex: 1,
        fontSize: moderateScale(16),
        fontWeight: '500',
        color: '#1E293B',
        marginLeft: scale(16),
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: wp(4),
        marginTop: hp(3),
        marginBottom: hp(1.5),
    },
    sectionTitle: {
        fontSize: moderateScale(18),
        fontWeight: '700',
        color: '#1E293B',
    },
    seeAllText: {
        fontSize: moderateScale(14),
        color: '#3B82F6',
        fontWeight: '600',
    },
    videoScroll: {
        paddingLeft: wp(4),
        paddingRight: wp(2),
    },
    videoCard: {
        width: wp(65),
        backgroundColor: '#FFFFFF',
        borderRadius: scale(16),
        marginRight: scale(12),
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    videoThumb: {
        width: '100%',
        height: verticalScale(110),
        backgroundColor: '#F1F5F9',
    },
    videoInfo: {
        padding: scale(14),
    },
    videoTitle: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: '#1E293B',
        height: verticalScale(40),
        lineHeight: moderateScale(20),
    },
    playRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: verticalScale(8),
    },
    watchNow: {
        fontSize: moderateScale(13),
        color: '#3B82F6',
        fontWeight: '600',
        marginLeft: scale(6),
    },
    tipsCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFBEB',
        marginHorizontal: wp(4),
        marginTop: hp(3),
        borderRadius: scale(16),
        padding: scale(16),
        borderWidth: 1,
        borderColor: '#FEF3C7',
    },
    tipsIconContainer: {
        width: scale(48),
        height: scale(48),
        borderRadius: scale(24),
        backgroundColor: '#FEF3C7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tipsContent: {
        flex: 1,
        marginLeft: scale(14),
    },
    tipsTitle: {
        fontSize: moderateScale(15),
        fontWeight: '700',
        color: '#92400E',
        marginBottom: verticalScale(4),
    },
    tipsText: {
        fontSize: moderateScale(13),
        color: '#78716C',
        lineHeight: moderateScale(20),
    },
});
