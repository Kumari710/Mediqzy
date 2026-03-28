import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import { saveUserProfile, getUserProfile } from '../../Utils/firebaseDatabase';
import { getCurrentUser } from '../../Utils/firebaseAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PersonalInfoScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationalId: '',
    homeAddress: '',
    dateOfBirth: '',
  });

  // Load user profile on mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      // 1. Try to load from Cache first for instant display
      const cachedProfile = await AsyncStorage.getItem('@user_profile_cache');
      if (cachedProfile) {
        setFormData(JSON.parse(cachedProfile));
        setLoading(false); // Stop loading early if we have cache
      }

      const user = getCurrentUser();
      if (user) {
        // Pre-fill email from Firebase Auth if not already set
        setFormData(prev => ({ ...prev, email: prev.email || user.email || user.phoneNumber || '' }));
      }

      // 2. Fetch from Firebase
      const result = await getUserProfile();
      if (result.success && result.data) {
        const profileData = { ...formData, ...result.data };
        setFormData(profileData);
        // Update cache
        await AsyncStorage.setItem('@user_profile_cache', JSON.stringify(profileData));
      }
    } catch (error) {
      console.log('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      Alert.alert('Required', 'Please enter your first and last name');
      return;
    }

    setSaving(true);
    try {
      const result = await saveUserProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        nationalId: formData.nationalId,
        homeAddress: formData.homeAddress,
        dateOfBirth: formData.dateOfBirth,
      });

      if (result.success) {
        Alert.alert('Success', 'Profile saved successfully!');
      } else {
        Alert.alert('Error', result.error || 'Failed to save profile');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#23238E" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={moderateScale(24)} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Personal Info</Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            style={styles.saveBtn}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#23238E" />
            ) : (
              <Text style={styles.saveText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Profile Image Section */}
          <View style={styles.imageSection}>
            <TouchableOpacity style={styles.imageContainer}>
              <Image
                source={require('../../images/IndianDoctor.png')}
                style={styles.profileImage}
              />
              <View style={styles.editIcon}>
                <Ionicons name="camera" size={moderateScale(16)} color="#fff" />
              </View>
            </TouchableOpacity>
            <Text style={styles.imageLabel}>Profile Image</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: scale(8) }]}>
                <Text style={styles.inputLabel}>First Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.firstName}
                  onChangeText={(value) => handleChange('firstName', value)}
                  placeholder="Enter first name"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: scale(8) }]}>
                <Text style={styles.inputLabel}>Last Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.lastName}
                  onChangeText={(value) => handleChange('lastName', value)}
                  placeholder="Enter last name"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={formData.email}
                editable={false}
                placeholder="Email address"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(value) => handleChange('phone', value)}
                placeholder="+91 98765 43210"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>National ID / Aadhaar</Text>
              <TextInput
                style={styles.input}
                value={formData.nationalId}
                onChangeText={(value) => handleChange('nationalId', value)}
                placeholder="Enter ID number"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Home Address</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.homeAddress}
                onChangeText={(value) => handleChange('homeAddress', value)}
                placeholder="Enter your address"
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Date of Birth</Text>
              <TextInput
                style={styles.input}
                value={formData.dateOfBirth}
                onChangeText={(value) => handleChange('dateOfBirth', value)}
                placeholder="DD/MM/YYYY"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Profile</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  safeArea: { flex: 1 },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: verticalScale(16),
    fontSize: moderateScale(14),
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.5),
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  backBtn: {
    width: scale(40),
    padding: scale(4),
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: '#1A1A2E',
  },
  saveBtn: {
    width: scale(60),
    alignItems: 'flex-end',
  },
  saveText: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: '#23238E',
  },
  scrollContent: {
    paddingBottom: hp(5),
  },
  imageSection: {
    alignItems: 'center',
    paddingVertical: hp(4),
  },
  imageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: scale(110),
    height: scale(110),
    borderRadius: scale(55),
    borderWidth: scale(3),
    borderColor: '#23238E',
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: scale(34),
    height: scale(34),
    borderRadius: scale(17),
    backgroundColor: '#23238E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  imageLabel: {
    fontSize: moderateScale(14),
    color: '#23238E',
    marginTop: verticalScale(12),
    fontWeight: '600',
  },
  formContainer: {
    paddingHorizontal: wp(5),
  },
  row: {
    flexDirection: 'row',
  },
  inputGroup: {
    marginBottom: verticalScale(20),
  },
  inputLabel: {
    fontSize: moderateScale(13),
    color: '#23238E',
    marginBottom: verticalScale(8),
    fontWeight: '600',
  },
  input: {
    fontSize: moderateScale(15),
    color: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(16),
    backgroundColor: '#F8FAFC',
  },
  inputDisabled: {
    backgroundColor: '#F1F5F9',
    color: '#94A3B8',
  },
  textArea: {
    minHeight: verticalScale(100),
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#23238E',
    marginHorizontal: wp(5),
    marginTop: verticalScale(10),
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(14),
    alignItems: 'center',
    shadowColor: '#23238E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: '700',
  },
});
