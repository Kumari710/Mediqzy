import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

export default function FindDoctorScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={moderateScale(24)} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Find a Doctor</Text>
          <View style={{ width: scale(40) }} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>How would you like to consult?</Text>
          <Text style={styles.subtitle}>Choose your preferred consultation type</Text>

          {/* Digital Visit Card */}
          <TouchableOpacity
            style={styles.consultCard}
            onPress={() => navigation.navigate('OnlineConsultationScreen', { tab: 'digital' })}
          >
            <LinearGradient
              colors={['#4A6CF7', '#6B8DFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            >
              <Image source={require('../../images/Online.png')} style={styles.cardImage} />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Digital Visit</Text>
                <Text style={styles.cardDescription}>
                  Consult with doctors online from the comfort of your home via video call
                </Text>
                <View style={styles.cardFeatures}>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={moderateScale(16)} color="#fff" />
                    <Text style={styles.featureText}>Video consultation</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={moderateScale(16)} color="#fff" />
                    <Text style={styles.featureText}>Chat with doctor</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={moderateScale(16)} color="#fff" />
                    <Text style={styles.featureText}>E-prescription</Text>
                  </View>
                </View>
              </View>
              <View style={styles.arrowCircle}>
                <Ionicons name="arrow-forward" size={moderateScale(20)} color="#4A6CF7" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Hospital Visit Card */}
          <TouchableOpacity
            style={styles.consultCard}
            onPress={() => navigation.navigate('HospitalListingScreen')}
          >
            <LinearGradient
              colors={['#FF6B35', '#FF8F65']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            >
              <Image source={require('../../images/HospitalVisit.png')} style={styles.cardImage} />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Hospital Visit</Text>
                <Text style={styles.cardDescription}>
                  Book an in-person appointment at a hospital or clinic near you
                </Text>
                <View style={styles.cardFeatures}>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={moderateScale(16)} color="#fff" />
                    <Text style={styles.featureText}>Face-to-face consultation</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={moderateScale(16)} color="#fff" />
                    <Text style={styles.featureText}>Physical examination</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={moderateScale(16)} color="#fff" />
                    <Text style={styles.featureText}>Lab tests available</Text>
                  </View>
                </View>
              </View>
              <View style={styles.arrowCircle}>
                <Ionicons name="arrow-forward" size={moderateScale(20)} color="#FF6B35" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle-outline" size={moderateScale(20)} color="#23238E" />
            <Text style={styles.infoText}>
              All our doctors are verified and experienced professionals
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  backBtn: {
    width: scale(40),
    padding: scale(4),
  },
  headerTitle: { fontSize: moderateScale(18), fontWeight: '700', color: '#222' },

  content: {
    flex: 1,
    padding: scale(20),
  },
  title: {
    fontSize: moderateScale(22),
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
    marginBottom: verticalScale(8),
  },
  subtitle: {
    fontSize: moderateScale(14),
    color: '#666',
    textAlign: 'center',
    marginBottom: verticalScale(30),
  },

  consultCard: {
    marginBottom: verticalScale(20),
    borderRadius: scale(20),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  cardGradient: {
    padding: scale(20),
    position: 'relative',
  },
  cardImage: {
    width: scale(80),
    height: scale(80),
    resizeMode: 'contain',
    position: 'absolute',
    right: scale(20),
    top: scale(20),
    opacity: 0.3,
  },
  cardContent: {
    paddingRight: scale(80),
  },
  cardTitle: {
    fontSize: moderateScale(22),
    fontWeight: '700',
    color: '#fff',
    marginBottom: verticalScale(10),
  },
  cardDescription: {
    fontSize: moderateScale(13),
    color: 'rgba(255,255,255,0.9)',
    lineHeight: moderateScale(20),
    marginBottom: verticalScale(16),
  },
  cardFeatures: {
    gap: verticalScale(8),
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: moderateScale(12),
    color: '#fff',
    marginLeft: scale(8),
    fontWeight: '500',
  },
  arrowCircle: {
    position: 'absolute',
    right: scale(20),
    bottom: scale(20),
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F4FF',
    borderRadius: scale(12),
    padding: scale(16),
    marginTop: verticalScale(10),
  },
  infoText: {
    flex: 1,
    fontSize: moderateScale(13),
    color: '#23238E',
    marginLeft: scale(10),
    fontWeight: '500',
  },
});
