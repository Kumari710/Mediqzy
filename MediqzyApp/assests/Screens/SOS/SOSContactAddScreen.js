import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

export default function SOSContactAddScreen({ navigation }) {
  const [name, setName] = useState('Swetha');
  const [number, setNumber] = useState('9123456789');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={moderateScale(24)} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Contacts</Text>
        </View>

        {/* Form */}
        <View style={styles.formCard}>
          <Text style={styles.label}>Name</Text>
          <View style={styles.inputRow}>
            <View style={styles.iconBox}>
              <FontAwesome5 name="user" size={moderateScale(18)} color="#64748B" />
            </View>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Name"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <Text style={[styles.label, { marginTop: verticalScale(20) }]}>Contact Number</Text>
          <View style={styles.inputRow}>
            <View style={styles.iconBox}>
              <FontAwesome5 name="phone" size={moderateScale(18)} color="#64748B" />
            </View>
            <TextInput
              style={styles.input}
              value={number}
              onChangeText={setNumber}
              placeholder="Contact Number"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <Text style={styles.infoText}>
          Maximum 3 SOS contacts can be added. When trigger the SOS function on the device, your SOS contacts will get your real-time location.
        </Text>

        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.confirmBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.confirmBtnText}>Confirm</Text>
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
  formCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: moderateScale(20),
    marginHorizontal: wp(5),
    marginTop: verticalScale(30),
    padding: moderateScale(20),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  label: {
    fontSize: moderateScale(14),
    color: '#1E293B',
    fontWeight: '600',
    marginBottom: verticalScale(8),
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  iconBox: {
    width: scale(48),
    height: verticalScale(48),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  input: {
    flex: 1,
    height: verticalScale(48),
    fontSize: moderateScale(15),
    paddingHorizontal: scale(12),
    color: '#1E293B',
  },
  infoText: {
    color: '#64748B',
    fontSize: moderateScale(13),
    textAlign: 'center',
    marginHorizontal: wp(10),
    marginTop: verticalScale(30),
    lineHeight: moderateScale(22),
  },
  bottomContainer: {
    marginTop: 'auto',
    marginBottom: hp(4),
    paddingHorizontal: wp(5),
  },
  confirmBtn: {
    backgroundColor: '#23238E',
    borderRadius: moderateScale(16),
    paddingVertical: verticalScale(16),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#23238E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: moderateScale(18),
    fontWeight: '700',
  },
});
