import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

export default function TermsConditionsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={moderateScale(24)} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Terms & Conditions</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: hp(5) }}>
          <Text style={styles.paragraph}>
            Welcome to Smart Health. By using our application, you agree to comply with and be bound by the following terms and conditions. Please read these terms carefully before using our services.
          </Text>

          <Text style={styles.sectionTitle}>Acceptance of Terms:</Text>
          <Text style={styles.paragraph}>
            By using Smart Health, you agree to comply with and be bound by these terms and conditions. If you do not agree with any part of these terms, please do not use the application.
          </Text>

          <Text style={styles.sectionTitle}>Eligibility:</Text>
          <Text style={styles.paragraph}>
            You must be a licensed medical professional to use Smart Health. By using the application, you represent and warrant that you are duly licensed and authorized to practice medicine in your jurisdiction.
          </Text>

          <Text style={styles.sectionTitle}>Registration:</Text>
          <Text style={styles.paragraph}>
            Users must provide accurate and complete information during the registration process. It is the user's responsibility to keep login credentials confidential.
          </Text>

          <Text style={styles.sectionTitle}>Patient Privacy and Confidentiality:</Text>
          <Text style={styles.paragraph}>
            Patient Data: As a user of Smart Health, you may have access to sensitive patient information. You agree to keep all patient data with the utmost confidentiality and in compliance with applicable privacy laws.
          </Text>
          <Text style={styles.paragraph}>
            Data Security: Smart Health employs industry-standard security measures to protect patient data. However, you are responsible for safeguarding your login credentials and reporting any unauthorized access immediately.
          </Text>

          <Text style={styles.sectionTitle}>Use of Smart Health:</Text>
          <Text style={styles.paragraph}>
            • Access to Smart Health grants you a non-exclusive, nontransferable license to use the application solely for professional, medical purposes.
          </Text>
          <Text style={styles.paragraph}>
            • Prohibited Activities: You agree not to engage in any act that may harm, disrupt, or interfere with the functioning of Smart Health, including but not limited to hacking, data mining, or unauthorized access.
          </Text>

          <Text style={styles.paragraph}>
            These terms and conditions are governed by the laws of jurisdiction. Any disputes arising under or in connection with these terms shall be resolved in the courts of Jurisdiction.
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
