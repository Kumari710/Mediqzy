import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import LinearGradient from 'react-native-linear-gradient';

const COLORS = {
  primary: '#23238E',
  success: '#10B981',
  white: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#64748B',
};

const RedeemSuccessScreen = ({ navigation, route }) => {
  const { offer } = route.params || { offer: { title: 'Doctor Consultation', points: '500' } };
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Animated.View style={[styles.iconContainer, { transform: [{ scale: scaleAnim }] }]}>
            <LinearGradient
              colors={[COLORS.success, '#34D399']}
              style={styles.gradientCircle}
            >
              <Ionicons name="checkmark" size={moderateScale(60)} color={COLORS.white} />
            </LinearGradient>
          </Animated.View>

          <Text style={styles.title}>Redemption Successful!</Text>
          <Text style={styles.subtitle}>
            You have successfully redeemed <Text style={styles.pointsText}>{offer.points}</Text> Health Coins for the <Text style={styles.offerText}>{offer.title}</Text>.
          </Text>

          <View style={styles.infoCard}>
            <Ionicons name="mail-outline" size={24} color={COLORS.primary} />
            <Text style={styles.infoText}>A confirmation email with your unique voucher code has been sent to your registered address.</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.homeBtn}
            onPress={() => navigation.navigate('HomeScreen')}
          >
            <Text style={styles.homeBtnText}>Back to Home</Text>
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
    paddingHorizontal: wp(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: hp(4),
  },
  gradientCircle: {
    width: scale(120),
    height: scale(120),
    borderRadius: scale(60),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: verticalScale(16),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: moderateScale(15),
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: moderateScale(22),
    marginBottom: hp(4),
  },
  pointsText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  offerText: {
    color: COLORS.text,
    fontWeight: '700',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#F0F4FF',
    padding: scale(20),
    borderRadius: scale(20),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  infoText: {
    flex: 1,
    marginLeft: scale(15),
    fontSize: moderateScale(13),
    color: COLORS.primary,
    lineHeight: moderateScale(18),
  },
  footer: {
    padding: wp(6),
  },
  homeBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: scale(16),
    paddingVertical: verticalScale(16),
    alignItems: 'center',
  },
  homeBtnText: {
    color: COLORS.white,
    fontSize: moderateScale(16),
    fontWeight: '700',
  },
});

export default RedeemSuccessScreen;
