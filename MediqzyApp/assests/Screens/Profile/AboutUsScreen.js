import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

export default function AboutUsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={moderateScale(24)} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>About Us</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: hp(5) }}>
          <Text style={styles.paragraph}>
            Welcome to SmartHealth – where innovation meets healthcare excellence. We understand the unique challenges that medical professionals face in today's rapidly evolving healthcare landscape.
          </Text>

          <Text style={styles.sectionTitle}>Our Mission:</Text>
          <Text style={styles.paragraph}>
            At Smart Health, we envision a future where healthcare is seamlessly integrated with technology, fostering collaboration and simplifying the workflow for patient care. We strive to be at the forefront of this transformation, providing doctors with tools that enhance their efficiency and elevate the standards of care.
          </Text>

          <Text style={styles.sectionTitle}>Who We Are:</Text>
          <Text style={styles.paragraph}>
            With a deep understanding of the healthcare industry and a passion for creating impactful solutions, we bring together the best of both worlds to shape the future of healthcare.
          </Text>

          <Text style={styles.sectionTitle}>Key Features:</Text>
          <Text style={styles.paragraph}>
            Intuitive Interface: Our app is designed Smart Health with a user-friendly interface, ensuring a seamless and efficient experience for doctors.
          </Text>
          <Text style={styles.paragraph}>
            Saves time managing complex schedules and appointment systems and saves the cost of hiring staff.
          </Text>
          <Text style={styles.paragraph}>
            Secure Communication: We prioritize the security and privacy of patient data. Smart Health facilitates secure communication channels, allowing doctors to connect to their patients while maintaining the highest standards of privacy.
          </Text>
          <Text style={styles.paragraph}>
            Collaborative Hub: Medical professionals can collaborate with fellow healthcare professionals to bring Smart Health to more than just a clinical platform where decisions with more synergies.
          </Text>

          <Text style={styles.paragraph}>
            We invite you to join Smart Health and be part of a community revolutionizing healthcare through technology. Together, let's redefine the way medicine is practiced, making a lasting impact in patient outcomes and the overall well-being of our communities.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.5),
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  backBtn: {
    width: scale(40),
    padding: scale(4),
  },
  headerTitle: { fontSize: moderateScale(18), fontWeight: '700', color: '#1A1A2E', marginLeft: scale(12) },
  content: {
    flex: 1,
    paddingHorizontal: wp(5),
    marginTop: verticalScale(20),
  },
  sectionTitle: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: '#23238E',
    marginTop: verticalScale(20),
    marginBottom: verticalScale(8),
  },
  paragraph: {
    fontSize: moderateScale(14),
    color: '#475569',
    lineHeight: moderateScale(22),
    marginBottom: verticalScale(16),
  },
});
