import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

export default function AddContactScreen({ navigation }) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');

  const handleAdd = () => {
    if (!name.trim() || !mobile.trim()) {
      alert('Please fill in all fields');
      return;
    }
    // TODO: Add contact logic
    alert('Contact added!');
    navigation?.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={moderateScale(24)} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add SOS Contact</Text>
        </View>

        <KeyboardAvoidingView
          style={styles.formContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.innerForm}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Contact Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={moderateScale(20)} color="#64748B" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter full name"
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mobile Number</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="call-outline" size={moderateScale(20)} color="#64748B" />
                <TextInput
                  style={styles.input}
                  placeholder="+91 00000 00000"
                  value={mobile}
                  onChangeText={setMobile}
                  keyboardType="phone-pad"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            <Text style={styles.infoText}>
              This contact will be notified immediately when you trigger an SOS emergency alert.
            </Text>
          </View>

          <View style={styles.bottomContainer}>
            <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
              <Text style={styles.addButtonText}>Add Contact</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
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
  formContainer: {
    flex: 1,
  },
  innerForm: {
    flex: 1,
    paddingHorizontal: wp(5),
    paddingTop: verticalScale(30),
  },
  inputGroup: {
    marginBottom: verticalScale(20),
  },
  inputLabel: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: verticalScale(8),
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: scale(16),
    height: verticalScale(54),
  },
  input: {
    flex: 1,
    fontSize: moderateScale(15),
    marginLeft: scale(12),
    color: '#1E293B',
  },
  infoText: {
    fontSize: moderateScale(13),
    color: '#64748B',
    lineHeight: moderateScale(20),
    marginTop: verticalScale(10),
    textAlign: 'center',
    paddingHorizontal: wp(5),
  },
  bottomContainer: {
    paddingHorizontal: wp(5),
    paddingBottom: Platform.OS === 'ios' ? hp(3) : hp(5),
  },
  addButton: {
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
  addButtonText: {
    color: '#fff',
    fontSize: moderateScale(18),
    fontWeight: '700',
  },
});
