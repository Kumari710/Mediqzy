import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Image,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

const COLORS = {
  primary: '#23238E',
  secondary: '#3B4FBF',
  accent: '#FFB800',
  success: '#10B981',
  white: '#FFFFFF',
  background: '#F8FAFC',
  text: '#1A1A2E',
  textSecondary: '#64748B',
};

const HealthCoinsScreen = ({ navigation, route }) => {
  const points = route?.params?.points ?? 2450; // Mock default for visual representation

  const pointsHistory = [
    { id: 1, title: 'Daily Step Goal', coins: '+50', date: 'Today, 10:30 AM', icon: 'footsteps' },
    { id: 2, title: 'Friend Referral', coins: '+500', date: 'Yesterday', icon: 'people' },
    { id: 3, title: 'Yoga Session', coins: '+25', date: '25 Jan 2024', icon: 'body' },
  ];

  const onShare = async () => {
    try {
      await Share.share({
        message: 'Join me on Mediqzt and earn Health Coins! Use my referral code: www.mediqzt.com/dibbendo',
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={moderateScale(24)} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Health Coins</Text>
          <TouchableOpacity style={styles.historyBtn}>
            <Ionicons name="time-outline" size={moderateScale(24)} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Hero Card */}
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroInfo}>
              <View>
                <Text style={styles.heroLabel}>Available Balance</Text>
                <View style={styles.heroPointsRow}>
                  <Image source={require('../../images/HealthCoin.png')} style={styles.heroCoinIcon} />
                  <Text style={styles.heroPointsValue}>{points.toLocaleString()}</Text>
                </View>
              </View>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>Gold Member</Text>
              </View>
            </View>

            <View style={styles.progressBarContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressText}>550 coins to Platinum</Text>
                <Text style={styles.progressPercent}>80%</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '80%' }]} />
              </View>
            </View>

            <TouchableOpacity
              style={styles.redeemBtn}
              onPress={() => navigation.navigate('OffersScreen')}
            >
              <Text style={styles.redeemBtnText}>Explore Rewards</Text>
              <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </LinearGradient>

          {/* Referral Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Invite & Earn</Text>
              <Text style={styles.earnBadge}>+500 Coins</Text>
            </View>
            <View style={styles.referralCard}>
              <View style={styles.referralDetails}>
                <Text style={styles.referralDesc}>Share your code with friends and earn 500 coins when they join.</Text>
                <View style={styles.codeContainer}>
                  <Text style={styles.referralCode}>MEDI-23456</Text>
                  <TouchableOpacity onPress={onShare} style={styles.copyBtn}>
                    <Ionicons name="copy-outline" size={18} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity onPress={onShare} style={styles.shareBtn}>
                <Ionicons name="share-social" size={24} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>

          {/* History Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.historyList}>
              {pointsHistory.map((item) => (
                <View key={item.id} style={styles.historyItem}>
                  <View style={styles.historyIconBox}>
                    <Ionicons name={item.icon} size={20} color={COLORS.primary} />
                  </View>
                  <View style={styles.historyTextInfo}>
                    <Text style={styles.historyItemTitle}>{item.title}</Text>
                    <Text style={styles.historyItemDate}>{item.date}</Text>
                  </View>
                  <Text style={styles.historyCoins}>{item.coins}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.5),
    backgroundColor: COLORS.white,
  },
  backBtn: {
    padding: scale(4),
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: COLORS.text,
  },
  historyBtn: {
    padding: scale(4),
  },
  scrollContent: {
    paddingBottom: hp(4),
  },
  heroCard: {
    margin: wp(5),
    borderRadius: scale(24),
    padding: scale(24),
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  heroInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: hp(3),
  },
  heroLabel: {
    color: '#E0E7FF',
    fontSize: moderateScale(14),
    fontWeight: '600',
    marginBottom: verticalScale(4),
  },
  heroPointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroCoinIcon: {
    width: scale(32),
    height: scale(32),
    marginRight: scale(10),
  },
  heroPointsValue: {
    color: COLORS.white,
    fontSize: moderateScale(32),
    fontWeight: '800',
  },
  levelBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    borderRadius: scale(20),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  levelText: {
    color: COLORS.white,
    fontSize: moderateScale(12),
    fontWeight: '700',
  },
  progressBarContainer: {
    marginBottom: hp(3),
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(8),
  },
  progressText: {
    color: '#E0E7FF',
    fontSize: moderateScale(12),
  },
  progressPercent: {
    color: COLORS.white,
    fontSize: moderateScale(12),
    fontWeight: '700',
  },
  progressBar: {
    height: verticalScale(8),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: scale(4),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: scale(4),
  },
  redeemBtn: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(12),
    borderRadius: scale(16),
    gap: scale(8),
  },
  redeemBtnText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: moderateScale(14),
  },
  section: {
    marginTop: hp(1),
    paddingHorizontal: wp(5),
    marginBottom: hp(3),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: COLORS.text,
  },
  earnBadge: {
    color: COLORS.success,
    fontWeight: '700',
    fontSize: moderateScale(14),
  },
  referralCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: scale(20),
    padding: scale(20),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  referralDetails: {
    flex: 1,
    marginRight: scale(15),
  },
  referralDesc: {
    color: COLORS.textSecondary,
    fontSize: moderateScale(13),
    lineHeight: moderateScale(18),
    marginBottom: verticalScale(12),
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: scale(12),
    paddingVertical: scale(8),
    borderRadius: scale(10),
    alignSelf: 'flex-start',
  },
  referralCode: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: moderateScale(14),
    letterSpacing: 1,
    marginRight: scale(8),
  },
  shareBtn: {
    backgroundColor: COLORS.primary,
    width: scale(56),
    height: scale(56),
    borderRadius: scale(28),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  historyList: {
    backgroundColor: COLORS.white,
    borderRadius: scale(20),
    padding: scale(16),
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  historyIconBox: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(12),
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(12),
  },
  historyTextInfo: {
    flex: 1,
  },
  historyItemTitle: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: COLORS.text,
  },
  historyItemDate: {
    fontSize: moderateScale(12),
    color: COLORS.textSecondary,
    marginTop: verticalScale(2),
  },
  historyCoins: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: COLORS.success,
  },
});

export default HealthCoinsScreen;
