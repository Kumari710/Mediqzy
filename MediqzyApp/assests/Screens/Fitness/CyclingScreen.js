import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

const COLORS = {
  primary: '#23238E',
  secondary: '#36CFC9',
  accent: '#FFB800',
  white: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#64748B',
  danger: '#EF4444',
  success: '#10B981',
};

export default function CyclingScreen({ navigation }) {
  const [isTracking, setIsTracking] = useState(false);
  const [timer, setTimer] = useState(0);
  const [distance, setDistance] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [calories, setCalories] = useState(0);
  const [region, setRegion] = useState({
    latitude: 12.9716, // Default to a city center (e.g. Chennai)
    longitude: 80.2452,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const timerInterval = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isTracking) {
      timerInterval.current = setInterval(() => {
        setTimer((prev) => prev + 1);
        // Simulate distance and calories
        setDistance((prev) => prev + 0.005);
        setCalories((prev) => prev + 0.1);
        setSpeed(18.5 + (Math.random() * 2));
      }, 1000);

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
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
    } else {
      clearInterval(timerInterval.current);
      pulseAnim.setValue(1);
    }

    return () => clearInterval(timerInterval.current);
  }, [isTracking]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTracking = () => {
    setIsTracking(!isTracking);
  };

  const stopTracking = () => {
    setIsTracking(false);
    const stats = {
      type: 'Cycling',
      duration: timer,
      distance: distance,
      calories: calories,
      speed: speed,
    };
    setTimer(0);
    setDistance(0);
    setCalories(0);
    setSpeed(0);
    navigation.navigate('PostWorkoutSummary', stats);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Map View Background */}
      <MapView
        style={styles.map}
        initialRegion={region}
        showsUserLocation
        followsUserLocation
      >
        <Marker coordinate={region}>
          <View style={styles.markerContainer}>
            <View style={styles.markerOutline}>
              <View style={styles.markerCore} />
            </View>
          </View>
        </Marker>
      </MapView>

      {/* Glass Overlay Header */}
      <SafeAreaView style={styles.headerOverlay} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="close" size={moderateScale(28)} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Cycling</Text>
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, { backgroundColor: isTracking ? COLORS.success : COLORS.danger }]} />
              <Text style={styles.statusText}>{isTracking ? 'LIVE' : 'READY'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.settingsBtn}>
            <Ionicons name="settings-outline" size={moderateScale(24)} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Bottom Panel */}
      <View style={styles.bottomPanel}>
        <LinearGradient
          colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,1)']}
          style={styles.statsContainer}
        >
          {/* Main Timer */}
          <View style={styles.timerSection}>
            <Text style={styles.timerLabel}>DURATION</Text>
            <Text style={styles.timerValue}>{formatTime(timer)}</Text>
          </View>

          <View style={styles.divider} />

          {/* Secondary Stats */}
          <View style={styles.secondaryStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>DISTANCE</Text>
              <Text style={styles.statValue}>{distance.toFixed(2)} <Text style={styles.statUnit}>km</Text></Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>AVG. SPEED</Text>
              <Text style={styles.statValue}>{speed.toFixed(1)} <Text style={styles.statUnit}>km/h</Text></Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>CALORIES</Text>
              <Text style={styles.statValue}>{calories.toFixed(0)} <Text style={styles.statUnit}>kcal</Text></Text>
            </View>
          </View>

          {/* Controls */}
          <View style={styles.controlsRow}>
            {isTracking ? (
              <>
                <TouchableOpacity style={styles.secondaryControl} onPress={stopTracking}>
                  <Ionicons name="stop" size={moderateScale(24)} color={COLORS.danger} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.mainControl} onPress={toggleTracking}>
                  <Ionicons name="pause" size={moderateScale(32)} color={COLORS.white} />
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={[styles.mainControl, { width: wp(70) }]} onPress={toggleTracking}>
                <Ionicons name="play" size={moderateScale(32)} color={COLORS.white} />
                <Text style={styles.startText}>START RIDE</Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
  },
  backBtn: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    backgroundColor: 'rgba(26, 26, 46, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: COLORS.white,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 26, 46, 0.5)',
    paddingHorizontal: scale(10),
    paddingVertical: scale(4),
    borderRadius: scale(12),
    marginTop: verticalScale(4),
  },
  statusDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    marginRight: scale(6),
  },
  statusText: {
    fontSize: moderateScale(10),
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 1,
  },
  settingsBtn: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    backgroundColor: 'rgba(26, 26, 46, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerOutline: {
    width: scale(24),
    height: scale(24),
    borderRadius: scale(12),
    backgroundColor: 'rgba(35, 35, 142, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  markerCore: {
    width: scale(10),
    height: scale(10),
    borderRadius: scale(5),
    backgroundColor: COLORS.primary,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: wp(4),
    paddingBottom: hp(4),
  },
  statsContainer: {
    borderRadius: scale(32),
    padding: scale(24),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  timerSection: {
    alignItems: 'center',
    marginBottom: hp(2),
  },
  timerLabel: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 1.5,
  },
  timerValue: {
    fontSize: moderateScale(48),
    fontWeight: '800',
    color: COLORS.primary,
    fontVariant: ['tabular-nums'],
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: hp(2),
  },
  secondaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(4),
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
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
    color: COLORS.text,
  },
  statUnit: {
    fontSize: moderateScale(12),
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(20),
  },
  mainControl: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  secondaryControl: {
    width: scale(60),
    height: scale(60),
    borderRadius: scale(30),
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startText: {
    color: COLORS.white,
    fontSize: moderateScale(18),
    fontWeight: '700',
    marginLeft: scale(12),
  },
});
