import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  Dimensions,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import { queryData, onDataChange } from '../../Utils/firebaseDatabase';
import { getCurrentUser } from '../../Utils/firebaseAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// Color palette matching the design
const COLORS = {
  primary: '#23238E',        // Deep navy blue (main brand color)
  primaryLight: '#3B4FBF',   // Lighter blue for gradients
  secondary: '#FFB800',      // Yellow/gold for coins
  background: '#FFFFFF',     // White background
  cardBg: '#EEF4FF',         // Light blue card background
  cardBgGreen: '#E8FFF5',    // Light green/mint for consult card
  cardBgBlue: '#E8F4FF',     // Light blue for smart health
  textPrimary: '#1A1A2E',    // Dark text
  textSecondary: '#6B7280',  // Gray text
  textMuted: '#9CA3B8',      // Muted gray text
  border: '#E5E7EB',         // Light border
  gradientStart: '#4361EE',  // Lab test gradient start
  gradientEnd: '#3B82F6',    // Lab test gradient end
  success: '#10B981',        // Green for success states
  navActive: '#23238E',      // Active nav color
  navInactive: '#9CA3AF',    // Inactive nav color
};

const HomeScreen = ({ navigation }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userName, setUserName] = useState('User');

  // Load cached data and set up listeners
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      const user = getCurrentUser();
      if (!user) return;

      // Helper to format name from email string
      const formatNameFromEmail = (emailStr) => {
        if (!emailStr) return 'User';
        // Extract the name part before @, ., or _
        const rawName = emailStr.split('@')[0].split('.')[0].split('_')[0];
        // Capitalize first letter and keep the rest of the name part
        return rawName.charAt(0).toUpperCase() + rawName.slice(1);
      };

      // 1. Initial name setup from local/auth
      const initializeUser = async () => {
        try {
          const cachedName = await AsyncStorage.getItem('@user_name_cache');
          if (cachedName && isMounted) setUserName(cachedName);

          if (!cachedName) {
            const sessionData = await AsyncStorage.getItem('@user_data');
            if (sessionData) {
              const parsed = JSON.parse(sessionData);
              if (parsed.username && isMounted) {
                setUserName(parsed.username);
              } else if (parsed.email && isMounted) {
                setUserName(formatNameFromEmail(parsed.email));
              }
            } else if (user.email && isMounted) {
              setUserName(formatNameFromEmail(user.email));
            }
          }
        } catch (e) {
          console.log('Init error:', e);
        }
      };
      initializeUser();

      // 2. Real-time name listener from profile
      const unsubscribeProfile = onDataChange(`users/${user.uid}/profile`, (data) => {
        if (data && data.firstName && isMounted) {
          setUserName(data.firstName);
          AsyncStorage.setItem('@user_name_cache', data.firstName);
        } else if (data && data.fullName && isMounted) {
          const first = data.fullName.split(' ')[0];
          setUserName(first);
          AsyncStorage.setItem('@user_name_cache', first);
        } else if (user.displayName && isMounted) {
          const first = user.displayName.split(' ')[0];
          setUserName(first);
          AsyncStorage.setItem('@user_name_cache', first);
        } else if (user.email && isMounted) {
          const formatted = formatNameFromEmail(user.email);
          setUserName(formatted);
          AsyncStorage.setItem('@user_name_cache', formatted);
        }
      });

      // 3. Real-time notification count
      const unsubscribeNotif = onDataChange(`notifications/${user.uid}`, (data) => {
        if (data && isMounted) {
          const unread = Object.values(data).filter(n => !n.read).length;
          setUnreadCount(unread);
          AsyncStorage.setItem('@unread_count_cache', unread.toString());
        }
      });

      return () => {
        isMounted = false;
        if (unsubscribeProfile) unsubscribeProfile();
        if (unsubscribeNotif) unsubscribeNotif();
      };
    }, [])
  );

  // Benefit cards data
  const benefitCards = [
    {
      id: 1,
      title: 'Mayden smart health',
      subtitle: 'Corporate Plan',
      validity: 'Valid till 30 April 2025',
      buttonText: 'Know your Benefits',
    },
    {
      id: 2,
      title: 'Personal Health Plan',
      subtitle: 'Premium Plan',
      validity: 'Valid till 15 June 2025',
      buttonText: 'View Details',
    },
  ];

  // Services data
  const services = [
    { id: 1, name: 'Find a Doctor', image: require('../../images/find-doctor.png'), screen: 'OnlineConsultationScreen' },
    { id: 2, name: 'Book Labtest', image: require('../../images/labtest.png'), screen: 'LabTestsScreen' },
    { id: 3, name: 'Pharmacy', image: require('../../images/pharmacy.png'), screen: 'PharmacyScreen' },
    { id: 4, name: 'Health', image: require('../../images/health.png'), screen: 'HealthTrackerScreen' },
    { id: 5, name: 'Activity', image: require('../../images/Activity.png'), screen: 'ActivityTrackerScreen' },
    // { id: 6, name: 'AI Assistant', image: require('../../images/AiAssistant.png'), screen: 'AIAssistantScreen' },
    // { id: 7, name: 'Emergency', image: require('../../images/SOS.png'), screen: 'EmergencyServicesScreen' },
  ];


  const renderBenefitCard = ({ item, index }) => (
    <LinearGradient
      colors={['#FFFFFF', '#EEF4FF', '#23238E']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.benefitCard}
    >
      <View style={styles.benefitContent}>
        <Text style={styles.benefitTitle}>{item.title}</Text>
        <Text style={styles.benefitSubtitle}>{item.subtitle}</Text>
        <Text style={styles.benefitValidity}>{item.validity}</Text>
        <TouchableOpacity
          style={styles.benefitButton}
          onPress={() => navigation.navigate(item.buttonText === 'Know your Benefits' ? 'BenefitsScreen' : 'MyPlansScreen')}
        >
          <Text style={styles.benefitButtonText}>{item.buttonText}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.benefitIconContainer}>
        <Image
          source={require('../../images/MaydenSmartHealth.png')}
          style={styles.benefitIcon}
        />
      </View>
    </LinearGradient>
  );

  const handleScroll = (event) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / (width - wp(10)));
    setActiveSlide(slideIndex);
  };

  return (
    <View style={[styles.container, { backgroundColor: COLORS.primary }]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <SafeAreaView style={[styles.container, { backgroundColor: COLORS.primary }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Hi {userName}!</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.headerIcon}
              onPress={() => navigation.navigate('HealthCoinsScreen')}
            >
              <View style={styles.coinContainer}>
                <Image
                  source={require('../../images/HealthCoin.png')}
                  style={styles.healthCoinImage}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerIcon}
              onPress={() => navigation.navigate('NotificationScreen')}
            >
              <Ionicons name="notifications" size={moderateScale(26)} color={COLORS.background} />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          style={{ backgroundColor: COLORS.background }}
        >
          {/* Benefit Cards Carousel */}
          <FlatList
            data={benefitCards}
            renderItem={renderBenefitCard}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            snapToInterval={width - wp(10)}
            decelerationRate="fast"
            contentContainerStyle={styles.carouselContainer}
          />

          {/* Carousel Dots */}
          <View style={styles.dotsContainer}>
            {benefitCards.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  activeSlide === index ? styles.activeDot : styles.inactiveDot,
                ]}
              />
            ))}
          </View>

          {/* Our Services */}
          <Text style={styles.sectionTitle}>Our Services</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.servicesContainer}
          >
            {services.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={styles.serviceCard}
                onPress={() => navigation.navigate(service.screen)}
                activeOpacity={0.7}
              >
                <Image source={service.image} style={styles.serviceImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Lab Test Banner */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate('LabTestsScreen')}
          >
            <LinearGradient
              colors={['#BCF8F4', '#D1FFFC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.labTestBanner}
            >
              <View style={styles.labTestContent}>
                <Text style={styles.labTestTitle}>Lab Test</Text>
                <Text style={styles.labTestSubtitle}>Get your full body checkup!</Text>
                <Text style={styles.labTestDiscount}>@ 20% discount</Text>
                <TouchableOpacity
                  style={styles.bookNowButton}
                  onPress={() => navigation.navigate('LabTestsScreen')}
                >
                  <Text style={styles.bookNowText}>Book Now</Text>
                </TouchableOpacity>
              </View>
              <Image
                source={require('../../images/biotechnoloy.png')}
                style={styles.labTestImage}
              />
            </LinearGradient>
          </TouchableOpacity>

          {/* Monitor Daily Activity */}
          <TouchableOpacity
            style={styles.activityCard}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('ActivityTrackerScreen')}
          >
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Monitor your Daily activity</Text>
              <Text style={styles.activitySubtitle}>Track your daily activities with your Device</Text>
              <TouchableOpacity
                style={styles.checkNowButton}
                onPress={() => navigation.navigate('ActivityTrackerScreen')}
              >
                <Text style={styles.checkNowText}>Check now</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.activityImageContainer}>
              <LinearGradient
                colors={['#E0F2FE', '#DBEAFE', '#C7D2FE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.activityImageBg}
              >
                <Image
                  source={require('../../images/HealthTracker.png')}
                  style={styles.activityImage}
                />
              </LinearGradient>
            </View>
          </TouchableOpacity>

          {/* Combined Consult & Smart Health Sections */}
          <View style={styles.combinedCardContainer}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => navigation.navigate('ConsultationScreen')}
              style={styles.consultTopSection}
            >
              <View style={styles.consultTextContainer}>
                <Text style={styles.consultTitleDesign}>Consult Doctors</Text>
                <Text style={styles.consultSubtitleDesign}>Get Expert Advice from our specialist Doctors</Text>
                <TouchableOpacity
                  style={styles.bookNowPill}
                  onPress={() => navigation.navigate('ConsultationScreen')}
                >
                  <Text style={styles.bookNowPillText}>Book Now</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.doctorsImageContainer}>
                <Image
                  source={require('../../images/ConsultDoctor1.png')}
                  style={styles.doctorImageSingle}
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => navigation.navigate('DeviceListScreen')}
              style={styles.smartHealthBottomBar}
            >
              <Text style={styles.smartHealthBarText}>Smart Health</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: hp(10) }} />
        </ScrollView>


      </SafeAreaView>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.5),
    backgroundColor: COLORS.primary,
  },
  greeting: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: COLORS.background,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleButton: {
    marginRight: scale(10),
  },
  toggleTrack: {
    width: scale(50),
    height: scale(28),
    backgroundColor: '#E5E7EB',
    borderRadius: scale(14),
    justifyContent: 'center',
    paddingHorizontal: scale(3),
  },
  toggleCircle: {
    width: scale(22),
    height: scale(22),
    backgroundColor: COLORS.background,
    borderRadius: scale(11),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  headerIcon: {
    marginLeft: scale(6),
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -verticalScale(4),
    right: -scale(4),
    backgroundColor: '#EF4444',
    borderRadius: scale(10),
    minWidth: scale(18),
    height: scale(18),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: moderateScale(10),
    fontWeight: '700',
  },
  coinContainer: {
    borderRadius: scale(8),
    padding: scale(2),
  },
  healthCoinImage: {
    width: scale(28),
    height: scale(28),
    resizeMode: 'contain',
  },
  scrollContent: {
    paddingTop: hp(1),
  },
  carouselContainer: {
    paddingHorizontal: wp(5),
  },
  benefitCard: {
    width: width - wp(10),
    borderRadius: scale(20),
    padding: scale(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: wp(3),
    shadowColor: '#4361EE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  benefitSubtitle: {
    fontSize: moderateScale(15),
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginTop: verticalScale(4),
  },
  benefitValidity: {
    fontSize: moderateScale(12),
    color: COLORS.textSecondary,
    marginTop: verticalScale(4),
  },
  benefitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: scale(8),
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(18),
    alignSelf: 'flex-start',
    marginTop: verticalScale(14),
  },
  benefitButtonText: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: COLORS.background,
  },
  benefitIconContainer: {
    width: scale(75),
    height: scale(75),
    // backgroundColor: COLORS.primary,
    borderRadius: scale(18),
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitIcon: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(10),
    // tintColor: COLORS.background,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: hp(2),
    marginBottom: hp(2.5),
  },
  dot: {
    height: scale(8),
    borderRadius: scale(4),
    marginHorizontal: scale(4),
  },
  activeDot: {
    backgroundColor: COLORS.primary,
    width: scale(24),
  },
  inactiveDot: {
    backgroundColor: '#D1D5DB',
    width: scale(8),
  },
  sectionTitle: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: COLORS.textPrimary,
    paddingHorizontal: wp(5),
    marginBottom: hp(2),
  },
  servicesContainer: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(2.5),
  },
  serviceCard: {
    alignItems: 'center',
    marginRight: scale(14),
  },
  serviceImage: {
    width: scale(95),
    height: scale(110),
    resizeMode: 'contain',
  },
  labTestBanner: {
    marginHorizontal: wp(5),
    borderRadius: scale(24),
    padding: scale(20),
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(2.5),
    overflow: 'hidden',
    height: verticalScale(190),
  },
  labTestContent: {
    flex: 1,
  },
  labTestTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: '#1A237E', // Deep navy from image
  },
  labTestSubtitle: {
    fontSize: moderateScale(13),
    color: '#1A1A2E',
    fontWeight: '500',
    marginTop: verticalScale(6),
  },
  labTestDiscount: {
    fontSize: moderateScale(13),
    color: '#1A1A2E',
    fontWeight: '500',
    marginTop: verticalScale(2),
  },
  bookNowButton: {
    backgroundColor: COLORS.primary,
    borderRadius: scale(10),
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(22),
    alignSelf: 'flex-start',
    marginTop: verticalScale(14),
  },
  bookNowText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: COLORS.background,
  },
  labTestImage: {
    width: scale(130),
    height: scale(110),
    resizeMode: 'contain',
  },
  activityCard: {
    marginHorizontal: wp(5),
    backgroundColor: COLORS.background,
    borderRadius: scale(24),
    padding: scale(20),
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(2.5),
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    height: verticalScale(190),
  },
  activityContent: {
    flex: 1,
    paddingRight: scale(10),
  },
  activityTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  activitySubtitle: {
    fontSize: moderateScale(13),
    color: COLORS.textSecondary,
    marginTop: verticalScale(8),
    lineHeight: moderateScale(20),
  },
  checkNowButton: {
    backgroundColor: COLORS.primary,
    borderRadius: scale(10),
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(22),
    alignSelf: 'flex-start',
    marginTop: verticalScale(14),
  },
  checkNowText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: COLORS.background,
  },
  activityImageContainer: {
    borderRadius: scale(20),
    overflow: 'hidden',
  },
  activityImageBg: {
    width: scale(110),
    height: scale(110),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scale(20),
  },
  activityImage: {
    width: scale(90),
    height: scale(90),
    resizeMode: 'contain',
  },
  combinedCardContainer: {
    marginHorizontal: wp(5),
    backgroundColor: COLORS.background,
    borderRadius: scale(20),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: hp(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    height: verticalScale(190),
  },
  consultTopSection: {
    flexDirection: 'row',
    padding: scale(15),
    paddingBottom: verticalScale(10),
    backgroundColor: '#FFFFFF',
    height: verticalScale(145),
  },
  consultTextContainer: {
    flex: 1.2,
    zIndex: 1,
    justifyContent: 'center',
  },
  consultTitleDesign: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: '#1A237E',
  },
  consultSubtitleDesign: {
    fontSize: moderateScale(13),
    color: '#1A237E',
    marginTop: verticalScale(6),
    lineHeight: moderateScale(18),
    fontWeight: '500',
    width: '90%',
  },
  bookNowPill: {
    backgroundColor: '#1A237E',
    borderRadius: scale(20),
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(20),
    alignSelf: 'flex-start',
    marginTop: verticalScale(12),
  },
  bookNowPillText: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  doctorsImageContainer: {
    position: 'absolute',
    right: -scale(5),
    bottom: -verticalScale(10),
    width: scale(160),
    height: verticalScale(160),
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    zIndex: 2,
  },
  doctorImageSingle: {
    width: scale(120),
    height: verticalScale(150),
    resizeMode: 'contain',
    zIndex: 1,
    bottom: -verticalScale(5),
  },
  smartHealthBottomBar: {
    backgroundColor: '#1A237E',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(18),
  },
  smartHealthBarText: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingVertical: hp(1.2),
    paddingBottom: hp(2),
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 12,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(12),
  },
  navIconActive: {
    marginBottom: verticalScale(2),
  },
  navText: {
    fontSize: moderateScale(11),
    color: COLORS.navInactive,
    marginTop: verticalScale(4),
    fontWeight: '500',
  },
  navTextActive: {
    fontSize: moderateScale(11),
    color: COLORS.primary,
    marginTop: verticalScale(4),
    fontWeight: '600',
  },
});
