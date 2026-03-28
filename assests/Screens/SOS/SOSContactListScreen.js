import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

export default function SOSContactListScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={moderateScale(24)} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>SOS Contacts</Text>
        </View>

        {/* Contact Card */}
        <View style={styles.contactCard}>
          <View>
            <Text style={styles.contactName}>Swetha</Text>
            <Text style={styles.contactNumber}>9123456789</Text>
          </View>
          <TouchableOpacity style={styles.deleteIconBtn}>
            <Ionicons name="trash-outline" size={moderateScale(28)} color="#23238E" />
          </TouchableOpacity>
        </View>

        {/* Bottom Edit Button */}
        <View style={styles.bottomEditBtnWrap}>
          <TouchableOpacity
            style={styles.editContactBtn}
            onPress={() => navigation.navigate('EditSOSContactScreen', { contact: { name: 'Swetha', number: '9123456789' } })}
          >
            <Text style={styles.editContactBtnText}>Edit Contact</Text>
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
  deleteIconBtn: {
    padding: scale(6),
  },
  bottomEditBtnWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: hp(4),
    alignItems: 'center',
    paddingHorizontal: wp(5),
  },
  editContactBtn: {
    backgroundColor: '#23238E',
    borderRadius: moderateScale(16),
    paddingVertical: verticalScale(16),
    alignItems: 'center',
    width: '100%',
    shadowColor: '#23238E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  editContactBtnText: {
    color: '#fff',
    fontSize: moderateScale(18),
    fontWeight: '700',
  },
});
