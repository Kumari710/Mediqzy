import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import { onDataChange, getUserAppointments, isFutureAppointment } from '../../Utils/firebaseDatabase';
import { getCurrentUser } from '../../Utils/firebaseAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AppointmentHistoryScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [selectedTab, setSelectedTab] = useState('online');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const formatDateLabel = (dateString) => {
    if (!dateString) return '20/05/25';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '20/05/25';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  const getStatusBadgeStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'upcoming': return { bg: '#DBEAFE', text: '#2563EB' };
      case 'completed': return { bg: '#D1FAE5', text: '#059669' };
      case 'cancelled': return { bg: '#FEE2E2', text: '#DC2626' };
      default: return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  // Load appointments when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadAppointments();
    }, [])
  );

  // Subscribe to real-time updates and handle Caching
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // 1. Try to load from Cache first for instant display
    const loadCache = async () => {
      try {
        const cached = await AsyncStorage.getItem(`@appt_cache_${user.uid}`);
        if (cached) {
          setAppointments(JSON.parse(cached));
          setLoading(false); // Stop loading early if we have cache
        }
      } catch (e) {
        console.log('Cache error:', e);
      }
    };
    loadCache();

    // 2. Real-time listener
    const unsubscribe = onDataChange(`appointments/${user.uid}`, async (data) => {
      if (data) {
        const apptList = Object.entries(data)
          .map(([key, value]) => ({
            ...value,
            id: key,
            firebaseKey: key,
          }))
          .filter(appt => appt.doctor && (typeof appt.doctor === 'string' ? appt.doctor : appt.doctor?.name));

        // Sort by createdAt descending (newest first)
        apptList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setAppointments(apptList);

        // Update cache
        await AsyncStorage.setItem(`@appt_cache_${user.uid}`, JSON.stringify(apptList));
      } else {
        setAppointments([]);
      }
      setLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const loadAppointments = async () => {
    const user = getCurrentUser();
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const result = await getUserAppointments();
      if (result.success && result.data) {
        // Map key to id and firebaseKey, ensuring Firebase key takes precedence
        const formattedData = result.data.map(item => ({
          ...item,
          id: item.key || item.id, // Firebase key as id
          firebaseKey: item.key || item.id, // Also explicit firebaseKey
        }));
        setAppointments(formattedData.reverse());
      }
    } catch (error) {
      console.log('Error loading appointments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAppointments();
  };

  // Filter appointments based on tab and search
  const filteredAppointments = appointments.filter((appt) => {
    const matchesTab = selectedTab === 'online'
      ? appt.type === 'online'
      : appt.type === 'clinic';

    const doctorName = typeof appt.doctor === 'string' ? appt.doctor : (appt.doctor?.name || '');
    const specialty = appt.doctor?.specialty || '';
    const hospitalName = appt.hospital?.name || '';
    const apptDate = appt.date || '';

    const matchesSearch = search === '' ||
      doctorName.toLowerCase().includes(search.toLowerCase()) ||
      specialty.toLowerCase().includes(search.toLowerCase()) ||
      hospitalName.toLowerCase().includes(search.toLowerCase()) ||
      apptDate.toLowerCase().includes(search.toLowerCase());

    return matchesTab && matchesSearch;
  });

  // Group appointments by date
  const groupedAppointments = filteredAppointments.reduce((groups, appt) => {
    const date = formatDateLabel(appt.createdAt);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(appt);
    return groups;
  }, {});


  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#23238E" />
        <Text style={styles.loadingText}>Loading appointments...</Text>
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
          <Text style={styles.headerTitle}>Appointment History</Text>
          <View style={{ width: scale(40) }} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={moderateScale(20)} color="#111" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search For Doctor, Date, Hospital..."
              placeholderTextColor="#999"
              value={search}
              onChangeText={setSearch}
            />
            <TouchableOpacity style={styles.filterBtn}>
              <Ionicons name="options-outline" size={moderateScale(20)} color="#333" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'online' && styles.tabActive]}
              onPress={() => setSelectedTab('online')}
            >
              <Text style={[styles.tabText, selectedTab === 'online' && styles.tabTextActive]}>
                Online Consultation
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'clinic' && styles.tabActive]}
              onPress={() => setSelectedTab('clinic')}
            >
              <Text style={[styles.tabText, selectedTab === 'clinic' && styles.tabTextActive]}>
                Clinic Visit
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {Object.keys(groupedAppointments).length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={moderateScale(70)} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No Appointments</Text>
            <Text style={styles.emptyText}>
              {selectedTab === 'online'
                ? 'You have no online consultation history'
                : 'You have no clinic visit history'}
            </Text>
            <TouchableOpacity
              style={styles.bookBtn}
              onPress={() => navigation.navigate('BookAppointmentScreen')}
            >
              <Ionicons name="add-circle" size={moderateScale(20)} color="#fff" />
              <Text style={styles.bookBtnText}>Book Appointment</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#23238E']} />
            }
          >
            {Object.entries(groupedAppointments).map(([dateLabel, appts]) => (
              <View key={dateLabel}>
                <Text style={styles.dayLabel}>{dateLabel}</Text>
                {appts.map((appt) => {
                  const isExpired = ((appt.status || '').toLowerCase() === 'upcoming' || appt.status === 'Online' || appt.status === 'Offline') && !isFutureAppointment(appt);
                  const statusStyle = isExpired
                    ? { bg: '#FFF1F2', text: '#BE123C' }
                    : getStatusBadgeStyle(appt.status);
                  return (
                    <TouchableOpacity
                      key={appt.id}
                      style={styles.appointmentCard}
                      onPress={() => navigation.navigate('AppointmentDetailsScreen', {
                        appointment: appt,
                        appointmentId: appt.id,
                      })}
                    >
                      <View style={styles.cardHeader}>
                        <Image
                          source={require('../../images/IndianDoctor.png')}
                          style={styles.doctorAvatar}
                        />
                        <View style={styles.doctorInfo}>
                          <Text style={styles.doctorName}>{typeof appt.doctor === 'string' ? appt.doctor : (appt.doctor?.name || 'Doctor')}</Text>
                          <Text style={styles.doctorSpecialty}>{appt.doctor?.specialty || 'Specialist'}</Text>
                        </View>
                        <View style={[styles.statusBadge, { borderColor: statusStyle.text, borderWidth: 1, backgroundColor: 'transparent' }]}>
                          <Text style={[styles.statusText, { color: statusStyle.text }]}>
                            {((appt.status || '').toLowerCase() === 'upcoming' || appt.status === 'Online' || appt.status === 'Offline') && !isFutureAppointment(appt)
                              ? (appt.type === 'online' ? 'Missed' : 'Expired')
                              : (appt.status ? appt.status.charAt(0).toUpperCase() + appt.status.slice(1) : 'Completed')}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.cardBody}>
                        <View style={styles.infoGrid}>
                          <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Patient name</Text>
                            <Text style={styles.infoValue}>{appt.patientName || 'Shivakumar'}</Text>
                          </View>
                          <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Consultation No.</Text>
                            <Text style={styles.infoValue}>{appt.id ? appt.id.slice(-8).toUpperCase() : 'RK9755472'}</Text>
                          </View>
                          <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Date</Text>
                            <View style={styles.dateBadge}>
                              <Text style={styles.dateBadgeText}>{appt.date}</Text>
                            </View>
                          </View>
                          <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Time</Text>
                            <View style={styles.timeBadge}>
                              <Text style={styles.timeBadgeText}>{appt.time}</Text>
                            </View>
                          </View>
                        </View>

                        {appt.type === 'clinic' && appt.hospital?.name && (
                          <View style={styles.locationRow}>
                            <Ionicons name="location" size={moderateScale(18)} color="#EF4444" />
                            <Text style={styles.locationText} numberOfLines={1}>
                              {appt.hospital.name}
                            </Text>
                            <TouchableOpacity style={styles.callBtn}>
                              <Ionicons name="call-outline" size={moderateScale(16)} color="#10B981" />
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  safeArea: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: verticalScale(16), fontSize: moderateScale(14), color: '#666' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    backgroundColor: '#fff',
  },
  backBtn: { width: scale(40), padding: scale(4) },
  headerTitle: { fontSize: moderateScale(18), fontWeight: '700', color: '#333' },

  searchContainer: { paddingHorizontal: wp(4), paddingVertical: hp(1), backgroundColor: '#fff' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: scale(25),
    paddingHorizontal: scale(15),
    height: verticalScale(50),
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: { flex: 1, fontSize: moderateScale(14), color: '#333', marginLeft: scale(10) },
  filterBtn: { padding: scale(4) },

  tabContainer: {
    backgroundColor: '#F9F9F9',
    marginHorizontal: wp(4),
    marginTop: verticalScale(15),
    borderRadius: scale(12),
    padding: scale(4),
  },
  tabRow: {
    flexDirection: 'row',
    gap: scale(4),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(12),
    borderRadius: scale(10),
  },
  tabActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  tabText: { fontSize: moderateScale(13), color: '#666', fontWeight: '500' },
  tabTextActive: { color: '#194E9D', fontWeight: '700' },

  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: hp(4) },

  dayLabel: {
    fontSize: moderateScale(14),
    color: '#999',
    textAlign: 'center',
    marginTop: verticalScale(20),
    marginBottom: verticalScale(10),
  },

  appointmentCard: {
    backgroundColor: '#fff',
    marginHorizontal: wp(4),
    borderRadius: scale(16),
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: verticalScale(12),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(14),
    backgroundColor: '#F7F8FA',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  doctorAvatar: { width: scale(40), height: scale(40), borderRadius: scale(8), marginRight: scale(12) },
  doctorInfo: { flex: 1 },
  doctorName: { fontSize: moderateScale(14), fontWeight: '700', color: '#194E9D' },
  doctorSpecialty: { fontSize: moderateScale(11), color: '#666', marginTop: 2 },
  statusBadge: { paddingHorizontal: scale(12), paddingVertical: verticalScale(4), borderRadius: scale(6) },
  statusText: { fontSize: moderateScale(11), fontWeight: '700' },

  cardBody: { padding: scale(12) },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  infoItem: { width: '25%', alignItems: 'flex-start' },
  infoLabel: { fontSize: moderateScale(9), color: '#999', marginBottom: verticalScale(10) },
  infoValue: { fontSize: moderateScale(11), fontWeight: '700', color: '#333' },
  dateBadge: { backgroundColor: '#5078B0', paddingHorizontal: scale(8), paddingVertical: verticalScale(4), borderRadius: scale(6) },
  dateBadgeText: { color: '#fff', fontSize: moderateScale(10), fontWeight: '700' },
  timeBadge: { backgroundColor: '#CF6666', paddingHorizontal: scale(8), paddingVertical: verticalScale(4), borderRadius: scale(6) },
  timeBadgeText: { color: '#fff', fontSize: moderateScale(10), fontWeight: '700' },

  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: verticalScale(8), paddingTop: verticalScale(12), borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  locationText: { flex: 1, fontSize: moderateScale(13), color: '#666', marginLeft: scale(8) },
  callBtn: { width: scale(36), height: scale(36), borderRadius: scale(18), borderWidth: 1, borderColor: '#eee', alignItems: 'center', justifyContent: 'center' },

  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: hp(10), marginTop: verticalScale(50) },
  emptyTitle: { fontSize: moderateScale(20), fontWeight: '700', color: '#374151', marginTop: verticalScale(20) },
  emptyText: { fontSize: moderateScale(14), color: '#9CA3AF', marginTop: verticalScale(8), textAlign: 'center', paddingHorizontal: wp(10) },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#194E9D',
    paddingHorizontal: scale(30),
    paddingVertical: verticalScale(12),
    borderRadius: scale(25),
    marginTop: verticalScale(24),
    gap: scale(8),
  },
  bookBtnText: { color: '#fff', fontWeight: '700', fontSize: moderateScale(15) },
});
