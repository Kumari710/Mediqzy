import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Circle, Defs, Stop, LinearGradient as SvgGradient } from 'react-native-svg';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const COLORS = {
  primary: '#23238E',
  accent: '#FFB800',
  white: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#64748B',
};

const CoinsCollectedScreen = ({ navigation, route }) => {
  const { points = 50 } = route.params || {};
  const [showPoints, setShowPoints] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const size = scale(220);
  const strokeWidth = scale(18);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    // Entrance Fade
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Progress animation
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 2000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setShowPoints(true);
      // Continuous pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, circumference * 0.15], // 85% full
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.headingArea}>
            <Text style={styles.title}>Bravo!</Text>
            <Text style={styles.subtitle}>You've earned coins for your activity.</Text>
          </View>

          {/* Progress Circle */}
          <View style={styles.circleContainer}>
            <Svg width={size} height={size}>
              <Defs>
                <SvgGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor={COLORS.accent} />
                  <Stop offset="100%" stopColor="#FFA400" />
                </SvgGradient>
              </Defs>

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
                stroke="url(#grad)"
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                rotation="-90"
                origin={`${size / 2}, ${size / 2}`}
              />
            </Svg>

            {/* Center Content */}
            <View style={styles.centerContent}>
              <Animated.View style={[styles.pointsBadge, { transform: [{ scale: pulseAnim }] }]}>
                <LinearGradient
                  colors={[COLORS.primary, '#3B4FBF']}
                  style={styles.pointsBg}
                >
                  <Text style={styles.pointsPlus}>+</Text>
                  <Text style={styles.pointsValue}>{points}</Text>
                  <Text style={styles.pointsLabel}>COINS</Text>
                </LinearGradient>
              </Animated.View>
            </View>
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="gift-outline" size={24} color={COLORS.primary} />
            <Text style={styles.infoText}>These coins can be redeemed for exclusive health vouchers and gear in the Rewards store.</Text>
          </View>
        </Animated.View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={() => navigation.navigate('HealthCoinsScreen', { points })}
          >
            <Text style={styles.continueBtnText}>Proceed to Wallet</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: hp(8),
    paddingHorizontal: wp(10),
  },
  headingArea: {
    alignItems: 'center',
    marginBottom: hp(6),
  },
  title: {
    fontSize: moderateScale(34),
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: moderateScale(16),
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: verticalScale(10),
    lineHeight: moderateScale(22),
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(8),
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointsBadge: {
    width: scale(130),
    height: scale(130),
    borderRadius: scale(65),
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  pointsBg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointsPlus: {
    color: COLORS.accent,
    fontSize: moderateScale(22),
    fontWeight: '800',
    position: 'absolute',
    top: verticalScale(25),
  },
  pointsValue: {
    fontSize: moderateScale(42),
    fontWeight: '900',
    color: COLORS.white,
  },
  pointsLabel: {
    fontSize: moderateScale(12),
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: verticalScale(-4),
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    padding: scale(20),
    borderRadius: scale(20),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoText: {
    flex: 1,
    marginLeft: scale(15),
    fontSize: moderateScale(13),
    color: COLORS.textSecondary,
    lineHeight: moderateScale(18),
  },
  footer: {
    padding: wp(6),
  },
  continueBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: scale(16),
    paddingVertical: verticalScale(18),
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  continueBtnText: {
    color: COLORS.white,
    fontSize: moderateScale(16),
    fontWeight: '700',
  },
});

export default CoinsCollectedScreen;
