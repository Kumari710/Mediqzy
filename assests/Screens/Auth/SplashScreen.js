import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import { scale, moderateScale, wp, hp } from '../../Utils/responsive';

const SplashScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Animate fade in and scale
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Check login status and navigate
    const checkLoginStatus = () => {
      setTimeout(() => {
        navigation.replace('Onboarding');
      }, 2500);
    };

    checkLoginStatus();
  }, [navigation, fadeAnim, scaleAnim]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0052CC" />
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* App Logo */}
        <View style={styles.imageContainer}>
          <Image
            source={require('../../images/doctor.png')}
            style={styles.doctorImage}
            resizeMode="contain"
          />
        </View>

        {/* App Title */}
        <Text style={styles.title}>MediQzy</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>Wellness & Care</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#23238E',
  },
  content: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: wp(5),
  },
  imageContainer: {
    marginBottom: hp(4),
  },
  doctorImage: {
    width: scale(320),
    height: scale(320),
  },
  title: {
    fontSize: moderateScale(32),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: hp(1.2),
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: moderateScale(16),
    fontWeight: '400',
    color: '#E0E7FF',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});

export default SplashScreen;
