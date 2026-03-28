import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import LinearGradient from 'react-native-linear-gradient';

const COLORS = {
  primary: '#23238E',
  secondary: '#FFA26B', // Yoga theme color
  white: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#64748B',
  zen: '#FDFCF0',
};

const POSES = [
  { name: 'Mountain Pose', duration: 30 },
  { name: 'Downward Dog', duration: 45 },
  { name: 'Warrior II', duration: 60 },
  { name: 'Tree Pose', duration: 45 },
  { name: 'Child Pose', duration: 60 },
];

export default function YogaScreen({ navigation }) {
  const [isStarted, setIsStarted] = useState(false);
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [poseTimer, setPoseTimer] = useState(POSES[0].duration);

  const mainTimerRef = useRef(null);
  const poseTimerRef = useRef(null);
  const breatheAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isStarted) {
      mainTimerRef.current = setInterval(() => {
        setSessionTimer(prev => prev + 1);
      }, 1000);

      poseTimerRef.current = setInterval(() => {
        setPoseTimer(prev => {
          if (prev <= 1) {
            moveToNextPose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Breathe Animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(breatheAnim, {
            toValue: 1.15,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(breatheAnim, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      clearInterval(mainTimerRef.current);
      clearInterval(poseTimerRef.current);
      breatheAnim.stopAnimation();
    }

    return () => {
      clearInterval(mainTimerRef.current);
      clearInterval(poseTimerRef.current);
    };
  }, [isStarted, currentPoseIndex]);

  const moveToNextPose = () => {
    if (currentPoseIndex < POSES.length - 1) {
      setCurrentPoseIndex(prev => prev + 1);
      setPoseTimer(POSES[currentPoseIndex + 1].duration);
    } else {
      setIsStarted(false);
      const stats = {
        type: 'Yoga',
        duration: sessionTimer,
        calories: sessionTimer * 0.05,
      };
      navigation.navigate('PostWorkoutSummary', stats);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Zen Background Pattern */}
      <View style={styles.zenBackground}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
      </View>

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="close-outline" size={32} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Yoga Flow</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          {/* Active Pose Card */}
          <View style={styles.poseContainer}>
            <Animated.View style={[styles.poseCircle, { transform: [{ scale: breatheAnim }] }]}>
              <LinearGradient
                colors={['#FFF8F0', '#FFE6D5']}
                style={styles.gradientCircle}
              >
                <Ionicons name="body-outline" size={moderateScale(80)} color={COLORS.secondary} />
              </LinearGradient>
            </Animated.View>

            <Text style={styles.currentPoseLabel}>CURRENT POSE</Text>
            <Text style={styles.poseName}>{POSES[currentPoseIndex].name}</Text>

            <View style={styles.timerContainer}>
              <Text style={styles.poseTimerValue}>{poseTimer}</Text>
              <Text style={styles.poseTimerUnit}>sec</Text>
            </View>
          </View>

          {/* Progress Dots */}
          <View style={styles.progressDots}>
            {POSES.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentPoseIndex && styles.activeDot,
                  index < currentPoseIndex && styles.completedDot
                ]}
              />
            ))}
          </View>
        </View>

        {/* Bottom Stats & Controls */}
        <View style={styles.footer}>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>SESSION TIME</Text>
              <Text style={styles.statValue}>{formatTime(sessionTimer)}</Text>
            </View>
            <View style={[styles.divider, { height: '60%' }]} />
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>CALORIES</Text>
              <Text style={styles.statValue}>{(sessionTimer * 0.05).toFixed(0)} kcal</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.mainBtn, isStarted && styles.pauseBtn]}
            onPress={() => setIsStarted(!isStarted)}
          >
            <Ionicons name={isStarted ? "pause" : "play"} size={moderateScale(32)} color={COLORS.white} />
            <Text style={styles.btnText}>{isStarted ? "PAUSE SESSION" : "START FLOW"}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.zen,
  },
  zenBackground: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute',
    top: -hp(10),
    right: -wp(20),
    width: wp(80),
    height: wp(80),
    borderRadius: wp(40),
    backgroundColor: '#FFF2E6',
  },
  circle2: {
    position: 'absolute',
    bottom: -hp(5),
    left: -wp(10),
    width: wp(60),
    height: wp(60),
    borderRadius: wp(30),
    backgroundColor: '#F5F5FF',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(5),
    paddingVertical: hp(1),
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: COLORS.text,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  poseContainer: {
    alignItems: 'center',
  },
  poseCircle: {
    width: scale(180),
    height: scale(180),
    borderRadius: scale(90),
    marginBottom: hp(4),
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  gradientCircle: {
    width: '100%',
    height: '100%',
    borderRadius: scale(90),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 8,
    borderColor: '#FFFFFF',
  },
  currentPoseLabel: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 2,
    marginBottom: verticalScale(8),
  },
  poseName: {
    fontSize: moderateScale(32),
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: hp(2),
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  poseTimerValue: {
    fontSize: moderateScale(64),
    fontWeight: '300',
    color: COLORS.text,
  },
  poseTimerUnit: {
    fontSize: moderateScale(18),
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginLeft: scale(8),
  },
  progressDots: {
    flexDirection: 'row',
    marginTop: hp(4),
    gap: scale(10),
  },
  dot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: '#E2E8F0',
  },
  activeDot: {
    width: scale(24),
    backgroundColor: COLORS.secondary,
  },
  completedDot: {
    backgroundColor: COLORS.primary,
  },
  footer: {
    paddingHorizontal: wp(8),
    paddingBottom: hp(4),
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: scale(24),
    paddingVertical: hp(2),
    marginBottom: hp(3),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: moderateScale(10),
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: verticalScale(4),
  },
  statValue: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: COLORS.primary,
  },
  divider: {
    width: 1,
    backgroundColor: '#E2E8F0',
  },
  mainBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(2),
    borderRadius: scale(40),
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  pauseBtn: {
    backgroundColor: COLORS.secondary,
    shadowColor: COLORS.secondary,
  },
  btnText: {
    color: COLORS.white,
    fontSize: moderateScale(16),
    fontWeight: '700',
    marginLeft: scale(12),
  },
});
