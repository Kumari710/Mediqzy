import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import { onDataChange, isFutureAppointment } from '../../Utils/firebaseDatabase';
import { getCurrentUser } from '../../Utils/firebaseAuth';

export default function ConsultationDashboardScreen({ navigation }) {
  const [appointments, setAppointments] = useState([]);
  const [nextAppointment, setNextAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeServiceTab, setActiveServiceTab] = useState('online'); // 'online' or 'clinic'
  const [search, setSearch] = useState('');

  const loadData = useCallback(() => {
    const user = getCurrentUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const unsubscribe = onDataChange(`appointments/${user.uid}`, (data) => {
      if (data) {
        const apptList = Object.entries(data).map(([key, value]) => ({
          ...value,
          id: key,
        }));

        // Filter and find the next upcoming appointment
        const upcoming = apptList
          .filter(isFutureAppointment)
          .sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
            const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
            return dateA - dateB;
          });

        setAppointments(apptList.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
          return dateB - dateA;
        }));
        setNextAppointment(upcoming.length > 0 ? upcoming[0] : null);
      } else {
        setAppointments([]);
        setNextAppointment(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = loadData();
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }, [loadData])
  );

  const handleJoinCall = (appt) => {
    if (!appt) return;
    const drObj = typeof appt.doctor === 'object' && appt.doctor !== null
      ? appt.doctor
      : { name: appt.doctor || appt.doctorName, specialty: appt.specialty || 'Specialist', id: appt.doctorId || '' };

    navigation.navigate('DocVideoCallScreen', {
      doctor: drObj,
      appointmentId: appt.id
    });
  };

  const handleChat = (appt) => {
    if (!appt) return;
    const drObj = typeof appt.doctor === 'object' && appt.doctor !== null
      ? appt.doctor
      : { name: appt.doctor || appt.doctorName, specialty: appt.specialty || 'Specialist', id: appt.doctorId || '' };

    navigation.navigate('DoctorChatScreen', {
      doctor: drObj,
      appointmentId: appt.id
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={moderateScale(20)} color="#444" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Consultation</Text>
          </View>

          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={() => navigation.navigate('ChatsScreen')} style={styles.headerIconBtn}>
              <Ionicons name="chatbubbles-outline" size={moderateScale(26)} color="#444" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('AppointmentHistoryScreen')} style={styles.headerIconBtn}>
              <Ionicons name="time-outline" size={moderateScale(28)} color="#444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={moderateScale(20)} color="#111" />
          <TextInput
            placeholder="Search For Doctors"
            placeholderTextColor="#999"
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={moderateScale(20)} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {/* Banner */}
        <LinearGradient
          colors={['#ffffff', '#B9E2FA', '#194E9D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>
              Book a consultation{'\n'}with top doctors
            </Text>
            <TouchableOpacity
              style={styles.bannerBtn}
              onPress={() => navigation.navigate('BookAppointmentScreen', { tab: 'digital' })}
            >
              <Text style={styles.bannerBtnText}>Book Now</Text>
            </TouchableOpacity>
          </View>
          <Image
            source={require('../../images/Chat.png')}
            style={styles.bannerImage}
          />
        </LinearGradient>

        {/* Book Consultation */}
        <Text style={styles.sectionTitle}>Book Consultation</Text>

        <View style={styles.optionRow}>
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => navigation.navigate('BookAppointmentScreen', { tab: 'digital' })}
          >
            <View style={styles.compositeIconContainer}>
              <Ionicons name="phone-portrait-outline" size={scale(45)} color="#194E9D" />
              <View style={styles.overlayBubble}>
                <Ionicons name="chatbubble-ellipses-outline" size={scale(24)} color="#194E9D" />
              </View>
            </View>
            <Text style={styles.optionText}>ONLINE CONSULT</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => navigation.navigate('BookAppointmentScreen', { tab: 'hospital' })}
          >
            <Ionicons name="business-outline" size={scale(50)} color="#194E9D" />
            <Text style={styles.optionText}>HOSPITAL VISIT</Text>
          </TouchableOpacity>
        </View>

        {/* Next Appointment Section */}
        {nextAppointment && (
          <>
            <Text style={styles.sectionTitle}>Next Appointment</Text>
            <TouchableOpacity
              style={styles.nextCard}
              onPress={() => navigation.navigate('AppointmentDetailsScreen', {
                appointment: nextAppointment,
                appointmentId: nextAppointment.id
              })}
            >
              <View style={styles.nextInfoRow}>
                <Ionicons name="calendar-outline" size={moderateScale(20)} color="#444" />
                <Text style={styles.nextText}>
                  Time/Date : <Text style={styles.blueBold}>{nextAppointment.time}, {nextAppointment.date}</Text>
                </Text>
              </View>
              <View style={styles.nextInfoRow}>
                <Ionicons name="information-circle-outline" size={moderateScale(20)} color="#444" />
                <Text style={styles.nextTextLabel}>
                  {nextAppointment.doctor?.name || 'Dr. Shalini Suresh'}, {nextAppointment.hospital?.name || 'Apollo Hospitals'}
                </Text>
              </View>
              <View style={styles.nextInfoRow}>
                <Ionicons name="card-outline" size={moderateScale(20)} color="#444" />
                <Text style={styles.redNextText}>
                  {nextAppointment.type === 'online' ? 'Online Consultation' : 'Hospital Visit'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={moderateScale(24)} color="#666" style={styles.nextArrow} />
            </TouchableOpacity>
          </>
        )}

        {loading ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#23238E" />
            <Text style={{ marginTop: 10, color: '#666' }}>Fetching appointments...</Text>
          </View>
        ) : appointments.length > 0 ? (
          <>
            {/* Tabs */}
            <View style={styles.tabRowContainer}>
              <TouchableOpacity
                style={[styles.serviceTab, activeServiceTab === 'online' && styles.serviceTabActive]}
                onPress={() => setActiveServiceTab('online')}
              >
                <Text style={[styles.serviceTabText, activeServiceTab === 'online' && styles.serviceTabActiveText]}>
                  Online Consultation
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.serviceTab, activeServiceTab === 'clinic' && styles.serviceTabActive]}
                onPress={() => setActiveServiceTab('clinic')}
              >
                <Text style={[styles.serviceTabText, activeServiceTab === 'clinic' && styles.serviceTabActiveText]}>
                  Hospital Visit
                </Text>
              </TouchableOpacity>
            </View>

            {/* Appointment Cards List */}
            {(() => {
              const filtered = appointments.filter(appt => {
                const matchesTab = (activeServiceTab === 'online' ? appt.type === 'online' : appt.type === 'clinic');
                const doctorName = typeof appt.doctor === 'string' ? appt.doctor : (appt.doctor?.name || '');
                const specialty = appt.doctor?.specialty || '';

                const matchesSearch = search === '' ||
                  doctorName.toLowerCase().includes(search.toLowerCase()) ||
                  specialty.toLowerCase().includes(search.toLowerCase());
                return matchesTab && matchesSearch;
              });

              if (filtered.length === 0) {
                return (
                  <View style={{ padding: 40, alignItems: 'center' }}>
                    <Ionicons name="search-outline" size={50} color="#ccc" />
                    <Text style={{ marginTop: 10, color: '#999', fontSize: 16 }}>No match found for "{search}"</Text>
                  </View>
                );
              }

              return filtered.map((appt, index) => (
                <TouchableOpacity
                  key={appt.id || `appt-${index}`}
                  style={styles.appointmentCard}
                  onPress={() => navigation.navigate('AppointmentDetailsScreen', {
                    appointment: appt,
                    appointmentId: appt.id
                  })}
                >
                  {/* Doctor Info Section */}
                  <View style={styles.docRow}>
                    <Image
                      source={require('../../images/IndianDoctor.png')}
                      style={styles.docImg}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.docName}>{typeof appt.doctor === 'string' ? appt.doctor : (appt.doctor?.name || 'Doctor')}</Text>
                      <Text style={styles.docSpec}>{appt.doctor?.specialty || 'Specialist'}</Text>
                      <View style={styles.metaInfoRow}>
                        <Text style={styles.metaInfoText}>{appt.doctor?.exp || '10 YEARS'} Exp</Text>
                        {appt.doctor?.regNo && (
                          <>
                            <View style={styles.metaDotSmall} />
                            <Text style={styles.metaInfoText}>Reg: {appt.doctor.regNo}</Text>
                          </>
                        )}
                      </View>
                    </View>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: appt.type === 'online' ? '#4CAF50' : '#FF9546' }
                    ]}>
                      <Text style={styles.onlineBadgeText}>{appt.type === 'online' ? 'Online' : 'Offline'}</Text>
                    </View>
                  </View>

                  {/* Info Grid */}
                  <View style={styles.infoGridContainer}>
                    <View style={styles.infoColumn}>
                      <Text style={styles.infoLabel}>Patient name</Text>
                      <Text style={styles.infoValue}>{appt.patientName || 'Shivakumar'}</Text>
                    </View>
                    <View style={styles.infoColumn}>
                      <Text style={styles.infoLabel}>Consultation No.</Text>
                      <Text style={styles.infoValue}>{appt.id ? appt.id.slice(-8).toUpperCase() : 'RK9755472'}</Text>
                    </View>
                    <View style={styles.infoColumn}>
                      <Text style={styles.infoLabel}>Date</Text>
                      <View style={styles.dateValueBadge}>
                        <Text style={styles.dateValueText}>{appt.date}</Text>
                      </View>
                    </View>
                    <View style={styles.infoColumn}>
                      <Text style={styles.infoLabel}>Time</Text>
                      <View style={styles.timeValueBadge}>
                        <Text style={styles.timeValueText}>{appt.time}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Location Section */}
                  {appt.type === 'clinic' && (
                    <View style={styles.locationContainer}>
                      <View style={styles.locationLeft}>
                        <Ionicons name="location" size={20} color="red" />
                        <Text style={styles.locationText} numberOfLines={1}>
                          {appt.hospital?.name || 'Apollo Hospitals, Valechery'}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Actions Section */}
                  {appt.type === 'online' ? (
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={styles.chatBtn}
                        onPress={() => handleChat(appt)}
                      >
                        <Text style={styles.chatText}>Chat</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.callBtn}
                        onPress={() => handleJoinCall(appt)}
                      >
                        <Ionicons name="videocam" size={18} color="#fff" />
                        <Text style={styles.callText}> Join Call</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}

                  <TouchableOpacity
                    style={styles.rescheduleBtnLarge}
                    onPress={() => navigation.navigate('RescheduleAppointmentScreen', { appointment: appt })}
                  >
                    <Text style={styles.rescheduleTextRed}>Reschedule</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ));
            })()}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={50} color="#ccc" />
            <Text style={styles.emptyText}>No upcoming appointments</Text>
            <TouchableOpacity
              style={styles.bannerBtn}
              onPress={() => navigation.navigate('FindDoctorScreen')}
            >
              <Text style={styles.bannerBtnText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { padding: scale(5), marginRight: scale(5) },
  headerTitle: { fontSize: moderateScale(18), fontWeight: '400', color: '#333' },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  headerIconBtn: { marginLeft: scale(15) },

  searchBox: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: wp(4),
    marginVertical: hp(1),
    paddingHorizontal: scale(15),
    height: verticalScale(50),
    borderRadius: scale(25),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: { marginLeft: scale(10), flex: 1, fontSize: moderateScale(15), color: '#333' },

  banner: {
    flexDirection: 'row',
    marginHorizontal: wp(4),
    marginVertical: hp(1.5),
    borderRadius: scale(20),
    padding: scale(16),
    borderWidth: 1,
    borderColor: '#194E9D30',
    overflow: 'hidden',
  },
  bannerTitle: { color: '#1a1a1a', fontSize: moderateScale(16), fontWeight: '700', lineHeight: 22 },
  bannerBtn: {
    backgroundColor: '#194E9D',
    marginTop: verticalScale(16),
    paddingVertical: verticalScale(8),
    borderRadius: scale(10),
    width: scale(100),
  },
  bannerBtnText: { color: '#fff', textAlign: 'center', fontWeight: '700', fontSize: moderateScale(13) },
  bannerImage: { width: scale(110), height: scale(100), alignSelf: 'flex-end' },

  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    marginHorizontal: wp(4),
    marginTop: verticalScale(16),
    color: '#333',
  },

  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: wp(4),
    marginVertical: hp(1.5),
  },
  optionCard: {
    backgroundColor: '#fff',
    width: '48%',
    paddingVertical: verticalScale(25),
    borderRadius: scale(15),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  compositeIconContainer: {
    width: scale(60),
    height: scale(60),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  overlayBubble: {
    position: 'absolute',
    bottom: -scale(2),
    right: -scale(2),
    backgroundColor: '#fff',
    borderRadius: scale(12),
    padding: scale(2),
  },
  optionText: { marginTop: verticalScale(15), fontWeight: '700', fontSize: moderateScale(13), color: '#194E9D' },

  nextCard: {
    backgroundColor: '#fff',
    marginHorizontal: wp(4),
    marginVertical: hp(1),
    padding: scale(16),
    borderRadius: scale(15),
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    position: 'relative',
  },
  nextInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: verticalScale(8) },
  nextText: { marginLeft: scale(10), fontSize: moderateScale(13), color: '#444' },
  blueBold: { fontWeight: '700', color: '#194E9D' },
  nextTextLabel: { marginLeft: scale(10), fontSize: moderateScale(13), color: '#444' },
  redNextText: { marginLeft: scale(10), fontSize: moderateScale(13), fontWeight: '700', color: '#E60012' },
  nextArrow: { position: 'absolute', right: scale(15), top: '50%', marginTop: -scale(12) },

  tabRowContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9F9F9',
    marginHorizontal: wp(4),
    padding: scale(4),
    borderRadius: scale(12),
    marginTop: verticalScale(15),
  },
  serviceTab: {
    flex: 1,
    paddingVertical: verticalScale(12),
    alignItems: 'center',
    borderRadius: scale(10),
  },
  serviceTabActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  serviceTabText: {
    fontSize: moderateScale(13),
    color: '#666',
    fontWeight: '500',
  },
  serviceTabActiveText: {
    color: '#194E9D',
    fontWeight: '700',
  },

  dateGroupLabel: {
    textAlign: 'center',
    color: '#999',
    fontSize: moderateScale(14),
    marginTop: verticalScale(20),
    marginBottom: verticalScale(10),
  },

  appointmentCard: {
    backgroundColor: '#fff',
    marginHorizontal: wp(4),
    marginVertical: hp(1),
    borderRadius: scale(16),
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  docRow: { flexDirection: 'row', alignItems: 'center', padding: scale(12), backgroundColor: '#F8F9FB' },
  docImg: { width: scale(40), height: scale(40), borderRadius: scale(8), marginRight: scale(12) },
  docName: { fontWeight: '700', fontSize: moderateScale(14), color: '#194E9D' },
  docSpec: { color: '#666', fontSize: moderateScale(11), marginTop: 2 },
  metaInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(4),
  },
  metaInfoText: {
    fontSize: moderateScale(11),
    color: '#94A3B8',
  },
  metaDotSmall: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#94A3B8',
    marginHorizontal: scale(6),
  },
  statusBadge: {
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(4),
    borderRadius: scale(6),
  },
  onlineBadgeText: { color: '#fff', fontSize: moderateScale(11), fontWeight: '700' },

  infoGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: scale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoColumn: {
    width: '25%',
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: moderateScale(9),
    color: '#999',
    marginBottom: verticalScale(10),
  },
  infoValue: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    color: '#333',
  },
  dateValueBadge: {
    backgroundColor: '#5078B0',
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: scale(6),
  },
  dateValueText: {
    color: '#fff',
    fontSize: moderateScale(10),
    fontWeight: '700',
  },
  timeValueBadge: {
    backgroundColor: '#CF6666',
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: scale(6),
  },
  timeValueText: {
    color: '#fff',
    fontSize: moderateScale(10),
    fontWeight: '700',
  },

  actionRow: {
    flexDirection: 'row',
    padding: scale(12),
    gap: scale(12),
  },
  chatBtn: {
    flex: 1,
    borderColor: '#E60012',
    borderWidth: 1,
    paddingVertical: verticalScale(8),
    borderRadius: scale(8),
    alignItems: 'center',
  },
  chatText: { color: '#E60012', fontWeight: '700', fontSize: moderateScale(13) },
  callBtn: {
    flex: 1,
    backgroundColor: '#E60012',
    paddingVertical: verticalScale(8),
    borderRadius: scale(8),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: scale(6),
  },
  callText: { color: '#fff', fontWeight: '700', fontSize: moderateScale(13) },

  rescheduleBtnLarge: {
    marginHorizontal: scale(12),
    marginBottom: scale(12),
    borderWidth: 1,
    borderColor: '#E60012',
    borderRadius: scale(8),
    paddingVertical: verticalScale(10),
    alignItems: 'center',
  },
  rescheduleTextRed: {
    color: '#E60012',
    fontWeight: '700',
    fontSize: moderateScale(13),
  },

  emptyContainer: {
    padding: wp(10),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    margin: wp(4),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    marginTop: 10,
    marginBottom: 15,
  },
});
