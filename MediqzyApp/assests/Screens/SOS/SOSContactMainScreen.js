import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

export default function SOSContactMainScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Ionicons
              name="arrow-back"
              size={moderateScale(24)}
              color="#333"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>SOS Contacts</Text>
        </View>

        {/* SOS Button */}
        <View style={styles.sosCircleWrap}>
          <LinearGradient
            colors={['#FF6B00', '#FF0000']}
            style={styles.sosCircle}
          >
            <Image
              source={require('../../images/SOS.png')}
              style={styles.sosImage}
              resizeMode="contain"
            />
          </LinearGradient>
        </View>

        {/* Info Text */}
        <Text style={styles.infoText}>
          Maximum 3 SOS contacts can be added. When you trigger the SOS function,
          your SOS contacts will receive your real-time location.
        </Text>

        {/* Contact Card */}
        <View style={styles.contactCard}>
          <View>
            <Text style={styles.contactName}>Swetha</Text>
            <Text style={styles.contactNumber}>9123456789</Text>
          </View>

          <View>
            <Text style={styles.sosContactBtn}>SOS Contact</Text>
          </View>
        </View>

        {/* Bottom Buttons */}
        <View style={styles.bottomButtons}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('SOSContactListScreen')}
          >
            <Text style={styles.editBtnText}>✏️ Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addContactBtn}
            onPress={() => navigation.navigate('SOSContactAddScreen')}
          >
            <Text style={styles.addContactBtnText}>Add Contact</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(2),
    paddingHorizontal: wp(5),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: scale(40),
    height: scale(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: '#1A1A2E',
    marginLeft: scale(10),
  },
  sosCircleWrap: {
    alignItems: 'center',
    marginTop: verticalScale(30),
    marginBottom: verticalScale(20),
  },
  sosCircle: {
    width: scale(150),
    height: scale(150),
    borderRadius: scale(75),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  sosImage: {
    width: scale(100),
    height: scale(100),
  },
  infoText: {
    color: '#64748B',
    fontSize: moderateScale(13),
    textAlign: 'center',
    marginHorizontal: wp(8),
    marginTop: verticalScale(15),
    lineHeight: moderateScale(22),
  },
  contactCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: moderateScale(20),
    marginHorizontal: wp(5),
    marginTop: verticalScale(30),
    padding: moderateScale(20),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  contactName: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: '#1A1A2E',
  },
  contactNumber: {
    fontSize: moderateScale(14),
    color: '#64748B',
    marginTop: verticalScale(2),
  },
  sosContactBtn: {
    borderWidth: 1,
    borderColor: '#FF3C00',
    color: '#FF3C00',
    borderRadius: moderateScale(8),
    paddingVertical: verticalScale(6),
    paddingHorizontal: scale(12),
    fontWeight: '700',
    fontSize: moderateScale(12),
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
    marginBottom: hp(4),
    marginHorizontal: wp(5),
    gap: scale(15),
  },
  editBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#23238E',
    borderRadius: moderateScale(16),
    paddingVertical: verticalScale(16),
    alignItems: 'center',
  },
  editBtnText: {
    color: '#23238E',
    fontSize: moderateScale(16),
    fontWeight: '700',
  },
  addContactBtn: {
    flex: 1,
    backgroundColor: '#23238E',
    borderRadius: moderateScale(16),
    paddingVertical: verticalScale(16),
    alignItems: 'center',
    shadowColor: '#23238E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addContactBtnText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: '700',
  },
});
