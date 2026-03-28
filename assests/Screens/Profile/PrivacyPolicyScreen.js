import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

export default function PrivacyPolicyScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={moderateScale(24)} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy Policy</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: hp(5) }}>
          <Text style={styles.paragraph}>
            Your Privacy is of paramount importance to us. Use and protect the Personal Data a key commitment for us. In India, including the Information Technology Act 2000 and the Information Technology Security Practices and Procedures, and sensitive personal data or Information Rules, 2011 ("Privacy Rules, 2011") to protect the privacy of your personal data.
          </Text>

          <Text style={styles.sectionTitle}>Collection of Personal Data:</Text>
          <Text style={styles.paragraph}>
            Personal Data we may collect from you, when provided as "Inclusive", "Personal Details" (e.g. Name, contact detail), e-mobile number, e-mail address) I provide by your to us to avails value added benefits.
          </Text>

          <Text style={styles.paragraph}>
            Our authorized third Party/Gateway partners may also collect information for the purposes of facilitating transactions through PayU.
          </Text>

          <Text style={styles.sectionTitle}>Reasonable Security practices and Procedures:</Text>
          <Text style={styles.paragraph}>
            We take various steps and measures to protect the security of Your Personal Data from misuse, loss, unauthorized access, modification or disclosure.
          </Text>

          <Text style={styles.sectionTitle}>Cookie Policy:</Text>
          <Text style={styles.paragraph}>
            Please note that a "cookie" is a small piece of information stored by a web server on a Web browser so it can be later read back from that browser. Cookies do not contain any information that is capable of personally identifying you.
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
