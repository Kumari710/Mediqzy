import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

const COLORS = {
  primary: '#23238E',
  secondary: '#3B4FBF',
  accent: '#FFB800',
  white: '#FFFFFF',
  background: '#F8FAFC',
  text: '#1A1A2E',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  success: '#10B981',
};

const categories = [
  { id: 'diabetes', name: 'Diabetes' },
  { id: 'heart', name: 'Heart Health' },
  { id: 'liver', name: 'Liver Health' },
  { id: 'scan', name: 'MRI CT SCAN' },
];

const defaultLabs = [
  { id: 1, name: 'Apollo Labs', location: 'T.nagar, Chennai 600017', img: require('../../images/apollo.png') },
  { id: 2, name: 'Apollo Labs', location: 'T.nagar, Chennai 600017', img: require('../../images/apollo.png') },
  { id: 3, name: 'Apollo Labs', location: 'T.nagar, Chennai 600017', img: require('../../images/apollo.png') },
  { id: 4, name: 'Apollo Labs', location: 'T.nagar, Chennai 600017', img: require('../../images/apollo.png') },
  { id: 5, name: 'Apollo Labs', location: 'T.nagar, Chennai 600017', img: require('../../images/apollo.png') },
];

export default function LabListingScreen({ navigation, route }) {
  const { quotations = null, title = 'Labs/Tests' } = route.params || {};
  const [search, setSearch] = useState('');
  const [labsView, setLabsView] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(-1);
  
  // Use quotations if passed, otherwise use default labs
  const labs = quotations || defaultLabs;
  
  // Filter labs based on search
  const filteredLabs = useMemo(() => {
    if (!search.trim()) return labs;
    const s = search.toLowerCase();
    return labs.filter(item => 
      (item.name || item.lab || '').toLowerCase().includes(s) ||
      (item.location || '').toLowerCase().includes(s) ||
      (item.token || '').toLowerCase().includes(s)
    );
  }, [labs, search]);

  // Render lab card
  const renderLabCard = (lab) => (
    <TouchableOpacity 
      key={lab.id} 
      style={styles.labCard}
      onPress={() => navigation.navigate('LabDetailsInfoScreen', { lab })}
    >
      <View style={styles.labMain}>
        <View style={styles.labImgContainer}>
          <Image source={lab.img || require('../../images/apollo.png')} style={styles.labImg} />
        </View>
        <View style={styles.labInfo}>
          <Text style={styles.labName}>{lab.name || lab.lab || 'Apollo Labs'}</Text>
          <Text style={styles.labLoc}>{lab.location || 'T.nagar, Chennai 600017'}</Text>
        </View>
        <TouchableOpacity style={styles.callIconBtn}>
          <Ionicons name="call-outline" size={24} color={COLORS.success} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Test Name"
              placeholderTextColor={COLORS.textSecondary}
              value={search}
              onChangeText={setSearch}
            />
            <TouchableOpacity>
              <MaterialCommunityIcons name="tune-variant" size={22} color={COLORS.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Labs View Toggle & Categories */}
        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {/* Labs View Toggle */}
            <View style={styles.labsViewToggle}>
              <Text style={styles.labsViewText}>Labs View</Text>
              <Switch
                value={labsView}
                onValueChange={setLabsView}
                trackColor={{ false: '#E2E8F0', true: COLORS.primary }}
                thumbColor={COLORS.white}
                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
              />
            </View>
            
            {/* Category Chips */}
            {categories.map((cat, index) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryChip, selectedCategory === index && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(selectedCategory === index ? -1 : index)}
              >
                <Text style={[styles.categoryText, selectedCategory === index && styles.categoryTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Labs Near You Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Labs Near You...</Text>
        </View>

        {/* Labs List */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
          {filteredLabs.length > 0 ? (
            filteredLabs.map((item) => renderLabCard(item))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No labs found</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: 12,
  },
  backBtn: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  searchSection: {
    paddingHorizontal: wp(5),
    marginBottom: 15,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  filterSection: {
    marginBottom: 15,
  },
  filterRow: {
    paddingHorizontal: wp(5),
    gap: 10,
  },
  labsViewToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: 5,
  },
  labsViewText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  categoryTextActive: {
    color: COLORS.white,
  },
  sectionHeader: {
    paddingHorizontal: wp(5),
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  listContent: {
    paddingHorizontal: wp(5),
    paddingBottom: 30,
  },
  labCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  labMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labImgContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  labImg: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
  },
  labInfo: {
    flex: 1,
    marginLeft: 12,
  },
  labName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  labLoc: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  callIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
});
