import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Image,
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
  border: '#E2E8F0',
};

const OffersScreen = ({ navigation }) => {
  const offers = [
    {
      id: 1,
      title: 'Doctor Consultation',
      subtitle: 'Flat 50% discount on first visit',
      points: '500',
      image: require('../../images/HC1.png'),
      category: 'Healthcare',
      color: '#4F46E5',
    },
    {
      id: 2,
      title: 'Pharmacy Voucher',
      subtitle: 'Save $20 on your next medicine buy',
      points: '200',
      image: require('../../images/CH2.png'),
      category: 'Medicine',
      color: '#EF4444',
    },
    {
      id: 3,
      title: 'Fitness Gear',
      subtitle: 'Premium Yoga Mat & Water Bottle',
      points: '1500',
      image: require('../../images/CH3.png'),
      category: 'Fitness',
      color: '#10B981',
    },
    {
      id: 5,
      title: 'Full Body Lab Test',
      subtitle: 'Get 30% off on diagnostic tests',
      points: '250',
      image: require('../../images/CH4.png'),
      category: 'Lab',
      color: '#F59E0B',
    },
  ];

  const handleOfferPress = (offer) => {
    navigation.navigate('OfferDetailScreen', { offer });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={moderateScale(24)} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Redeem Coins</Text>
          <View style={styles.pointsBadge}>
            <Image source={require('../../images/HealthCoin.png')} style={styles.badgeCoin} />
            <Text style={styles.badgeText}>2,450</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.introSection}>
            <Text style={styles.title}>Exclusive Rewards</Text>
            <Text style={styles.subtitle}>Redeem your hard-earned coins for amazing healthcare benefits and products.</Text>
          </View>

          {/* Offers List */}
          {offers.map((offer) => (
            <TouchableOpacity
              key={offer.id}
              style={styles.offerCard}
              onPress={() => handleOfferPress(offer)}
              activeOpacity={0.9}
            >
              <View style={[styles.cardAccent, { backgroundColor: offer.color }]} />
              <View style={styles.cardContent}>
                <View style={styles.imageContainer}>
                  <Image source={offer.image} style={styles.offerImage} resizeMode="cover" />
                </View>
                <View style={styles.offerInfo}>
                  <Text style={styles.categoryText}>{offer.category}</Text>
                  <Text style={styles.offerTitle}>{offer.title}</Text>
                  <Text style={styles.offerSubtitle} numberOfLines={1}>{offer.subtitle}</Text>

                  <View style={styles.pointsRow}>
                    <Image source={require('../../images/HealthCoin.png')} style={styles.coinTiny} />
                    <Text style={styles.pointsText}>{offer.points} <Text style={styles.pointsLabel}>Coins</Text></Text>
                  </View>
                </View>
                <View style={styles.actionColumn}>
                  <View style={styles.redeemIcon}>
                    <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {/* Bonus Info */}
          <LinearGradient
            colors={['#EEF2FF', '#FFFFFF']}
            style={styles.bonusCard}
          >
            <Ionicons name="sparkles" size={24} color={COLORS.primary} />
            <View style={styles.bonusInfo}>
              <Text style={styles.bonusTitle}>Want more coins?</Text>
              <Text style={styles.bonusDesc}>Invite your friends to join Mediqzt and get 500 coins instantly!</Text>
            </View>
            <TouchableOpacity style={styles.bonusBtn} onPress={() => navigation.navigate('HealthCoinsScreen')}>
              <Text style={styles.bonusBtnText}>Invite</Text>
            </TouchableOpacity>
          </LinearGradient>
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
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backBtn: {
    padding: scale(4),
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: COLORS.text,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: scale(10),
    paddingVertical: scale(6),
    borderRadius: scale(12),
  },
  badgeCoin: {
    width: scale(16),
    height: scale(16),
    marginRight: scale(6),
  },
  badgeText: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: COLORS.text,
  },
  scrollContent: {
    paddingBottom: hp(4),
  },
  introSection: {
    paddingHorizontal: wp(6),
    paddingTop: hp(3),
    paddingBottom: hp(2),
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: verticalScale(8),
  },
  subtitle: {
    fontSize: moderateScale(14),
    color: COLORS.textSecondary,
    lineHeight: moderateScale(20),
  },
  offerCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: wp(6),
    marginBottom: verticalScale(16),
    borderRadius: scale(20),
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardAccent: {
    width: scale(6),
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(12),
  },
  imageContainer: {
    width: scale(70),
    height: scale(70),
    borderRadius: scale(12),
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
  },
  offerImage: {
    width: '100%',
    height: '100%',
  },
  offerInfo: {
    flex: 1,
    marginLeft: scale(15),
    paddingRight: scale(10),
  },
  categoryText: {
    fontSize: moderateScale(10),
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: verticalScale(2),
  },
  offerTitle: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: verticalScale(2),
  },
  offerSubtitle: {
    fontSize: moderateScale(12),
    color: COLORS.textSecondary,
    marginBottom: verticalScale(6),
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinTiny: {
    width: scale(14),
    height: scale(14),
    marginRight: scale(4),
  },
  pointsText: {
    fontSize: moderateScale(14),
    fontWeight: '800',
    color: COLORS.primary,
  },
  pointsLabel: {
    fontSize: moderateScale(12),
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  actionColumn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  redeemIcon: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bonusCard: {
    margin: wp(6),
    borderRadius: scale(24),
    padding: scale(20),
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bonusInfo: {
    flex: 1,
    marginLeft: scale(15),
    marginRight: scale(10),
  },
  bonusTitle: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: verticalScale(2),
  },
  bonusDesc: {
    fontSize: moderateScale(12),
    color: COLORS.textSecondary,
    lineHeight: moderateScale(16),
  },
  bonusBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
    borderRadius: scale(10),
  },
  bonusBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: moderateScale(13),
  },
});

export default OffersScreen;
