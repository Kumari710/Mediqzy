import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Image,
  ScrollView,
  Share,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

const COLORS = {
  primary: '#23238E',
  secondary: '#3B4FBF',
  accent: '#FFB800',
  white: '#FFFFFF',
  background: '#F8FAFC',
  text: '#1A1A2E',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  red: '#EF4444',
};

const OfferDetailScreen = ({ route, navigation }) => {
  const { offer } = route.params || {};

  const onShare = async () => {
    try {
      await Share.share({
        message: `Check out this ${offer.title} on Mediqzt! I'm redeeming my Health Coins for it.`,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Hero Header */}
      <View style={styles.heroSection}>
        <Image source={offer.image} style={styles.heroImage} resizeMode="cover" />
        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.8)']}
          style={styles.heroGradient}
        >
          <SafeAreaView style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onShare} style={styles.shareBtn}>
              <Ionicons name="share-outline" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </SafeAreaView>

          <View style={styles.heroBottom}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{offer.category}</Text>
            </View>
            <Text style={styles.heroTitle}>{offer.title}</Text>
            <Text style={styles.heroSubtitle}>{offer.subtitle}</Text>
          </View>
        </LinearGradient>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Cost Section */}
        <View style={styles.costCard}>
          <View style={styles.costInfo}>
            <Text style={styles.costLabel}>Redemption Cost</Text>
            <View style={styles.pointsRow}>
              <Image source={require('../../images/HealthCoin.png')} style={styles.coinIcon} />
              <Text style={styles.pointsValue}>{offer.points} <Text style={styles.pointsUnit}>Coins</Text></Text>
            </View>
          </View>
          <View style={styles.balanceInfo}>
            <Text style={styles.balanceLabel}>Your Balance</Text>
            <Text style={styles.balanceValue}>2,450</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About this Reward</Text>
          <Text style={styles.descriptionText}>
            Elevate your healthcare journey with this exclusive offer. Use your wallet coins to reduce costs and enjoy premium benefits. This voucher can be redeemed instantly at participating centers or through the Mediqzt app.
          </Text>
        </View>

        {/* How to use */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How to Redeem</Text>
          <View style={styles.stepRow}>
            <View style={styles.stepNumber}><Text style={styles.stepText}>1</Text></View>
            <Text style={styles.stepDesc}>Click the "Claim Now" button below.</Text>
          </View>
          <View style={styles.stepRow}>
            <View style={styles.stepNumber}><Text style={styles.stepText}>2</Text></View>
            <Text style={styles.stepDesc}>Receive a unique voucher code in your email and app wallet.</Text>
          </View>
          <View style={styles.stepRow}>
            <View style={styles.stepNumber}><Text style={styles.stepText}>3</Text></View>
            <Text style={styles.stepDesc}>Present the code at checkout or use it during online booking.</Text>
          </View>
        </View>

        {/* FAQ Preview */}
        <TouchableOpacity style={styles.faqPreview}>
          <Text style={styles.faqText}>Terms & Conditions</Text>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <View style={{ height: hp(12) }} />
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.claimBtn}
          onPress={() => navigation.navigate('RedeemSuccessScreen', { offer })}
        >
          <Text style={styles.claimBtnText}>Claim Reward</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  heroSection: {
    height: hp(40),
    width: '100%',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: wp(5),
    paddingTop: Platform.OS === 'ios' ? 0 : verticalScale(30),
  },
  backBtn: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtn: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBottom: {
    paddingHorizontal: wp(6),
    paddingBottom: hp(4),
  },
  categoryBadge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: scale(10),
    paddingVertical: scale(4),
    borderRadius: scale(6),
    alignSelf: 'flex-start',
    marginBottom: verticalScale(10),
  },
  categoryText: {
    color: '#000',
    fontSize: moderateScale(10),
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: COLORS.white,
    fontSize: moderateScale(26),
    fontWeight: '800',
    marginBottom: verticalScale(4),
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: moderateScale(14),
  },
  scrollContent: {
    paddingTop: hp(3),
  },
  costCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    marginHorizontal: wp(6),
    borderRadius: scale(20),
    padding: scale(20),
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp(4),
  },
  costInfo: {
    flex: 1,
  },
  costLabel: {
    fontSize: moderateScale(12),
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: verticalScale(4),
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinIcon: {
    width: scale(24),
    height: scale(24),
    marginRight: scale(8),
  },
  pointsValue: {
    fontSize: moderateScale(22),
    fontWeight: '800',
    color: COLORS.primary,
  },
  pointsUnit: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  balanceInfo: {
    alignItems: 'flex-end',
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
    paddingLeft: scale(20),
  },
  balanceLabel: {
    fontSize: moderateScale(11),
    color: COLORS.textSecondary,
    marginBottom: verticalScale(4),
  },
  balanceValue: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: COLORS.text,
  },
  section: {
    paddingHorizontal: wp(6),
    marginBottom: hp(4),
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: verticalScale(12),
  },
  descriptionText: {
    fontSize: moderateScale(14),
    color: COLORS.textSecondary,
    lineHeight: moderateScale(22),
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  stepNumber: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(12),
  },
  stepText: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: moderateScale(12),
  },
  stepDesc: {
    flex: 1,
    fontSize: moderateScale(13),
    color: COLORS.textSecondary,
  },
  faqPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: wp(6),
    paddingVertical: verticalScale(16),
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  faqText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: COLORS.text,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: wp(6),
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  claimBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: scale(16),
    paddingVertical: verticalScale(16),
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  claimBtnText: {
    color: COLORS.white,
    fontSize: moderateScale(16),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default OfferDetailScreen;
