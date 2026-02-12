import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

const LANGUAGES = [
  { id: 'en', name: 'English', nativeName: 'English' },
  { id: 'es', name: 'Spanish', nativeName: 'Español' },
  { id: 'fr', name: 'French', nativeName: 'Français' },
  { id: 'de', name: 'German', nativeName: 'Deutsch' },
  { id: 'zh', name: 'Chinese', nativeName: '中文' },
  { id: 'ja', name: 'Japanese', nativeName: '日本語' },
  { id: 'ko', name: 'Korean', nativeName: '한국어' },
  { id: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { id: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { id: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
];

export default function SetLanguageScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const filteredLanguages = LANGUAGES.filter(
    (lang) =>
      lang.name.toLowerCase().includes(search.toLowerCase()) ||
      lang.nativeName.toLowerCase().includes(search.toLowerCase())
  );

  const renderLanguageItem = ({ item }) => {
    const isSelected = selectedLanguage === item.id;
    return (
      <TouchableOpacity
        style={[styles.languageItem, isSelected && styles.languageItemActive]}
        onPress={() => setSelectedLanguage(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.languageInfo}>
          <Text style={[styles.languageName, isSelected && styles.languageTextActive]}>
            {item.name}
          </Text>
          <Text style={[styles.nativeName, isSelected && styles.languageTextActiveSecondary]}>
            {item.nativeName}
          </Text>
        </View>
        <View style={[styles.radioButton, isSelected && styles.radioButtonActive]}>
          {isSelected && <View style={styles.radioButtonInner} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back-outline" size={moderateScale(26)} color="#1A1A2E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Language</Text>
          <View style={{ width: scale(40) }} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Select Language</Text>
          <Text style={styles.subtitle}>Choose your preferred language for the app interface.</Text>

          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={moderateScale(20)} color="#9CA3B8" />
            <TextInput
              style={styles.input}
              placeholder="Search language..."
              placeholderTextColor="#9CA3B8"
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {/* Language List */}
          <FlatList
            data={filteredLanguages}
            keyExtractor={(item) => item.id}
            renderItem={renderLanguageItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No languages found</Text>
              </View>
            }
          />
        </View>

        {/* Save Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.saveButton} onPress={() => navigation.goBack()}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    padding: scale(4),
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: '#1A1A2E',
  },
  content: {
    flex: 1,
    paddingHorizontal: wp(6),
    paddingTop: hp(3),
  },
  title: {
    fontSize: moderateScale(22),
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: verticalScale(8),
  },
  subtitle: {
    fontSize: moderateScale(14),
    color: '#64748B',
    lineHeight: moderateScale(20),
    marginBottom: hp(3),
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: scale(12),
    paddingHorizontal: scale(16),
    height: verticalScale(50),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: hp(2),
  },
  input: {
    flex: 1,
    fontSize: moderateScale(16),
    color: '#1A1A2E',
    marginLeft: scale(10),
  },
  listContainer: {
    paddingBottom: hp(4),
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: scale(16),
    padding: scale(16),
    marginBottom: verticalScale(12),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  languageItemActive: {
    borderColor: '#23238E',
    backgroundColor: '#F0F4FF',
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#1A1A2E',
  },
  nativeName: {
    fontSize: moderateScale(13),
    color: '#94A3B8',
    marginTop: verticalScale(2),
  },
  languageTextActive: {
    color: '#23238E',
  },
  languageTextActiveSecondary: {
    color: '#3B4FBF',
  },
  radioButton: {
    width: scale(22),
    height: scale(22),
    borderRadius: scale(11),
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonActive: {
    borderColor: '#23238E',
  },
  radioButtonInner: {
    width: scale(12),
    height: scale(12),
    borderRadius: scale(6),
    backgroundColor: '#23238E',
  },
  emptyContainer: {
    paddingTop: hp(10),
    alignItems: 'center',
  },
  emptyText: {
    fontSize: moderateScale(16),
    color: '#94A3B8',
  },
  footer: {
    padding: wp(6),
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  saveButton: {
    backgroundColor: '#23238E',
    borderRadius: scale(30),
    paddingVertical: hp(1.8),
    alignItems: 'center',
    shadowColor: '#23238E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(16),
    fontWeight: '700',
  },
});
