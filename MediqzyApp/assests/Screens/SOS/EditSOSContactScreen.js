import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import SOSSuccessModal from './SOSSuccessModal';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

export default function EditSOSContactScreen({ navigation, route }) {
  const [name, setName] = useState(route.params?.contact?.name || 'Swetha');
  const [number, setNumber] = useState(route.params?.contact?.number || '9123456789');
  const [showModal, setShowModal] = useState(false);

  const handleConfirm = () => {
    setShowModal(true);

    // close modal & go back after 1.5s
    setTimeout(() => {
      setShowModal(false);
      navigation.goBack();
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back-outline" size={moderateScale(26)} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Contact</Text>
          <View style={{ width: scale(32) }} />
        </View>

        {/* Form */}
        <View style={styles.formCard}>
          <Text style={styles.label}>Name</Text>
          <View style={styles.inputRow}>
            <Ionicons name="person-outline" size={22} color="#777" />
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter name"
              placeholderTextColor="#AAA"
            />
          </View>

          <Text style={[styles.label, { marginTop: 22 }]}>Contact Number</Text>
          <View style={styles.inputRow}>
            <Ionicons name="call-outline" size={22} color="#777" />
            <TextInput
              style={styles.input}
              value={number}
              onChangeText={setNumber}
              placeholder="Enter phone number"
              placeholderTextColor="#AAA"
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>
        </View>

        {/* Info */}
        <Text style={styles.infoText}>
          You can add up to 3 SOS contacts. When SOS is triggered, your real-time
          location will be shared with them.
        </Text>

        {/* Button */}
        <View style={styles.bottomBtnWrap}>
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </TouchableOpacity>
        </View>

        {/* Success Modal */}
        <SOSSuccessModal visible={showModal} />
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
    flex: 1,
    textAlign: 'center',
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: '#1A1A2E',
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
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: verticalScale(10),
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: moderateScale(12),
    paddingHorizontal: scale(14),
    paddingVertical: Platform.OS === 'ios' ? verticalScale(14) : verticalScale(10),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    fontSize: moderateScale(16),
    marginLeft: scale(10),
    color: '#1E293B',
  },
  infoText: {
    fontSize: moderateScale(13),
    color: '#64748B',
    marginHorizontal: wp(10),
    marginTop: verticalScale(20),
    lineHeight: moderateScale(22),
    textAlign: 'center',
  },
  bottomBtnWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: hp(4),
    alignItems: 'center',
    paddingHorizontal: wp(5),
  },
  confirmButton: {
    backgroundColor: '#23238E',
    borderRadius: moderateScale(16),
    paddingVertical: verticalScale(16),
    width: '100%',
    alignItems: 'center',
    shadowColor: '#23238E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: moderateScale(18),
    fontWeight: '700',
  },
});
