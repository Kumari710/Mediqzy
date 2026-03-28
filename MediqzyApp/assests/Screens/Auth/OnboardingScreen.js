import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

const OnboardingScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const onboardingData = [
    {
      id: 1,
      title: 'Schedule Doctor Appointments',
      description:
        'Book appointments with your preferred doctors hassle-free. Choose from a list of experienced healthcare professionals.',
      image: require('../../images/1.png'),
    },
    {
      id: 2,
      title: 'Medication Reminders',
      description:
        'Never miss a dose with smart medication reminders. Manage your prescriptions and stay on top of your health routine.',
      image: require('../../images/2.png'),
    },
    {
      id: 3,
      title: 'Secure Health Consultations',
      description:
        'Connect with healthcare professionals through secure consultations. Get expert advice from licensed doctors anytime, anywhere.',
      image: require('../../images/3.png'),
    },
  ];

  const handleSkip = () => {
    navigation.replace('Login');
  };

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.replace('Login');
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FBFF" />

        {/* Skip Button */}
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        {/* Curved Decoration Top */}
        <View style={styles.curveTop} />

        <View style={{ flex: 1, justifyContent: 'center' }}>
          {/* Slide Content */}
          <View style={styles.slide}>
            {/* Illustration */}
            <View style={styles.illustrationContainer}>
              <Image
                source={onboardingData[currentIndex].image}
                style={styles.image}
                resizeMode="contain"
              />
            </View>

            {/* Title */}
            <Text style={styles.title}>{onboardingData[currentIndex].title}</Text>

            {/* Description */}
            <Text style={styles.description}>
              {onboardingData[currentIndex].description}
            </Text>
          </View>

          {/* Pagination Dots */}
          <View style={styles.paginationContainer}>
            {onboardingData.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor: index === currentIndex ? '#001F7F' : '#D0D0D0',
                    width: index === currentIndex ? scale(30) : scale(12),
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Curved Decoration Bottom */}
        <View style={styles.curveBottom} />

        {/* Next Button */}
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Ionicons name="arrow-forward" size={moderateScale(28)} color="#FFFFFF" />
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FBFF',
  },
  skipButton: {
    position: 'absolute',
    top: hp(2),
    right: wp(5),
    zIndex: 10,
  },
  skipText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#0052CC',
  },
  curveTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: scale(250),
    height: scale(250),
    borderBottomRightRadius: scale(250),
    backgroundColor: '#E0F7F7',
    opacity: 0.6,
  },
  curveBottom: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: scale(300),
    height: scale(300),
    borderTopLeftRadius: scale(300),
    backgroundColor: '#E0F7F7',
    opacity: 0.5,
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(8),
    zIndex: 1,
  },
  illustrationContainer: {
    width: scale(280),
    height: scale(280),
    marginBottom: hp(4),
  },
  image: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: moderateScale(28),
    fontWeight: '700',
    color: '#001F7F',
    textAlign: 'center',
    marginBottom: hp(1.5),
  },
  description: {
    fontSize: moderateScale(15),
    fontWeight: '400',
    color: '#666666',
    textAlign: 'center',
    lineHeight: moderateScale(22),
    marginBottom: hp(4),
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(3),
    zIndex: 1,
  },
  dot: {
    height: scale(6),
    borderRadius: scale(3),
    marginHorizontal: scale(4),
  },
  nextButton: {
    position: 'absolute',
    bottom: hp(4),
    right: wp(8),
    width: scale(60),
    height: scale(60),
    borderRadius: scale(30),
    backgroundColor: '#001F7F',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(24),
    fontWeight: '600',
  },
});

export default OnboardingScreen;
