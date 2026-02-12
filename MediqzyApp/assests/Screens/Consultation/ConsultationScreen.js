import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, TextInput, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import { getUpcomingAppointments } from '../../Utils/firebaseDatabase';
import { getCurrentUser } from '../../Utils/firebaseAuth';



export default function ConsultationScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  // Fetch upcoming appointments when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchUpcomingAppointments();
    }, [])
  );

  const fetchUpcomingAppointments = async () => {
    const user = getCurrentUser();
    if (!user) {
      setLoadingAppointments(false);
      return;
    }

    try {
      const result = await getUpcomingAppointments(5);
      if (result.success && result.data) {
        setAppointments(result.data);
      }
    } catch (error) {
      console.log('Error fetching appointments:', error);
    } finally {
      setLoadingAppointments(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={moderateScale(24)} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Consultation</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('ChatsScreen')}>
              <Ionicons name="chatbubbles-outline" size={moderateScale(22)} color="#23238E" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('AppointmentHistoryScreen')}>
              <Ionicons name="time-outline" size={moderateScale(22)} color="#23238E" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Hero Banner */}
          <LinearGradient
            colors={['#23238E', '#3B4FBF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroBanner}
          >
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>Book a consultation{'\n'}with top doctors</Text>
              <Text style={styles.heroSubtitle}>Get expert medical advice from home</Text>
              <TouchableOpacity
                style={styles.heroBtn}
                onPress={() => navigation.navigate('BookAppointmentScreen')}
              >
                <Text style={styles.heroBtnText}>Book Now</Text>
              </TouchableOpacity>
            </View>
            <Image source={require('../../images/doctor.png')} style={styles.heroImage} />
          </LinearGradient>

          {/* Consultation Types */}
          <View style={styles.typeCardsContainer}>
            <TouchableOpacity
              style={styles.typeCard}
              onPress={() => navigation.navigate('OnlineConsultationScreen', { tab: 'digital' })}
            >
              <View style={[styles.typeIconBox, { backgroundColor: '#E8F4FF' }]}>
                <Ionicons name="videocam" size={moderateScale(24)} color="#23238E" />
              </View>
              <Text style={styles.typeCardTitle}>Digital Visit</Text>
              <Text style={styles.typeCardSubtitle}>Online Consult</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.typeCard}
              onPress={() => navigation.navigate('HospitalListingScreen')}
            >
              <View style={[styles.typeIconBox, { backgroundColor: '#FFF0E8' }]}>
                <Ionicons name="business" size={moderateScale(24)} color="#FF6B35" />
              </View>
              <Text style={styles.typeCardTitle}>Hospital Visit</Text>
              <Text style={styles.typeCardSubtitle}>In-person</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.typeCard}
              onPress={() => navigation.navigate('BenefitsScreen')}
            >
              <View style={[styles.typeIconBox, { backgroundColor: '#E8FFF0' }]}>
                <Ionicons name="gift" size={moderateScale(24)} color="#4CAF50" />
              </View>
              <Text style={styles.typeCardTitle}>OP Benefits</Text>
              <Text style={styles.typeCardSubtitle}>View offers</Text>
            </TouchableOpacity>
          </View>

          {/* Upcoming Appointments */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
              <TouchableOpacity onPress={() => navigation.navigate('AppointmentHistoryScreen')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            {loadingAppointments ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#23238E" />
              </View>
            ) : appointments.length === 0 ? (
              <View style={styles.emptyAppointments}>
                <Ionicons name="calendar-outline" size={moderateScale(40)} color="#D1D5DB" />
                <Text style={styles.emptyText}>No upcoming appointments</Text>
                <TouchableOpacity
                  style={styles.bookNowBtn}
                  onPress={() => navigation.navigate('BookAppointmentScreen')}
                >
                  <Text style={styles.bookNowText}>Book Now</Text>
                </TouchableOpacity>
              </View>
            ) : (
              appointments.map((appt) => (
                <TouchableOpacity
                  key={appt.id}
                  style={styles.appointmentCard}
                  onPress={() => navigation.navigate('AppointmentDetailsScreen', { appointment: appt, appointmentId: appt.id })}
                >
                  <View style={styles.appointmentHeader}>
                    <Image source={require('../../images/IndianDoctor.png')} style={styles.appointmentImage} />
                    <View style={styles.appointmentInfo}>
                      <Text style={styles.appointmentDoctor}>{appt.doctor?.name || 'Doctor'}</Text>
                      <Text style={styles.appointmentSpecialty}>{appt.doctor?.specialty || 'Specialist'}</Text>
                      <View style={styles.appointmentMeta}>
                        <View style={[styles.statusBadge, appt.type === 'online' ? styles.onlineBadge : styles.offlineBadge]}>
                          <Text style={styles.statusText}>{appt.type === 'online' ? 'Online' : 'In-Person'}</Text>
                        </View>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={moderateScale(20)} color="#888" />
                  </View>

                  <View style={styles.appointmentDetails}>
                    <View style={styles.detailItem}>
                      <Ionicons name="calendar-outline" size={moderateScale(16)} color="#666" />
                      <Text style={styles.detailText}>{appt.date}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Ionicons name="time-outline" size={moderateScale(16)} color="#666" />
                      <Text style={styles.detailText}>{appt.time}</Text>
                    </View>
                  </View>

                  {appt.type === 'online' ? (
                    <View style={styles.appointmentActions}>
                      <TouchableOpacity
                        style={styles.chatActionBtn}
                        onPress={() => navigation.navigate('DoctorChatScreen', { doctor: appt.doctor })}
                      >
                        <Ionicons name="chatbubble-outline" size={moderateScale(18)} color="#23238E" />
                        <Text style={styles.chatActionText}>Chat</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.joinCallBtn}
                        onPress={() => navigation.navigate('DocVideoCallScreen', { doctor: appt.doctor })}
                      >
                        <Ionicons name="videocam" size={moderateScale(18)} color="#fff" />
                        <Text style={styles.joinCallText}>Join Call</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.locationRow}>
                      <Ionicons name="location" size={moderateScale(16)} color="#E53935" />
                      <Text style={styles.locationText}>{appt.hospital?.name || appt.location || 'Hospital'}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => navigation.navigate('OnlineConsultationScreen')}
              >
                <Ionicons name="search" size={moderateScale(24)} color="#23238E" />
                <Text style={styles.quickActionText}>Find Doctor</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => navigation.navigate('AppointmentHistoryScreen')}
              >
                <Ionicons name="calendar" size={moderateScale(24)} color="#23238E" />
                <Text style={styles.quickActionText}>My Appointments</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => navigation.navigate('ChatsScreen')}
              >
                <Ionicons name="chatbubbles" size={moderateScale(24)} color="#23238E" />
                <Text style={styles.quickActionText}>My Chats</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => navigation.navigate('CouponScreen')}
              >
                <Ionicons name="pricetag" size={moderateScale(24)} color="#23238E" />
                <Text style={styles.quickActionText}>Offers</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  backBtn: {
    width: scale(40),
    padding: scale(4),
  },
  headerTitle: { fontSize: moderateScale(18), fontWeight: '700', color: '#222' },
  headerIcons: { flexDirection: 'row', gap: scale(12) },
  iconBtn: { padding: scale(4) },
  scrollContent: { paddingBottom: hp(4) },

  heroBanner: {
    flexDirection: 'row',
    marginHorizontal: wp(4),
    marginTop: verticalScale(16),
    borderRadius: scale(20),
    padding: scale(20),
    overflow: 'hidden',
  },
  heroContent: { flex: 1 },
  heroTitle: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: '#fff',
    lineHeight: moderateScale(28),
  },
  heroSubtitle: {
    fontSize: moderateScale(12),
    color: 'rgba(255,255,255,0.8)',
    marginTop: verticalScale(8),
  },
  heroBtn: {
    backgroundColor: '#fff',
    borderRadius: scale(10),
    paddingVertical: verticalScale(12),
    paddingHorizontal: wp(5),
    alignSelf: 'flex-start',
    marginTop: verticalScale(16),
  },
  heroBtnText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#23238E',
  },
  heroImage: {
    width: scale(120),
    height: verticalScale(140),
    resizeMode: 'contain',
    position: 'absolute',
    right: scale(10),
    bottom: 0,
  },

  typeCardsContainer: {
    flexDirection: 'row',
    paddingHorizontal: wp(4),
    marginTop: verticalScale(20),
    gap: scale(12),
  },
  typeCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: scale(16),
    padding: scale(16),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  typeIconBox: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  typeCardTitle: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
  },
  typeCardSubtitle: {
    fontSize: moderateScale(10),
    color: '#888',
    marginTop: verticalScale(2),
  },

  section: {
    marginTop: verticalScale(24),
    paddingHorizontal: wp(4),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: '#222',
  },
  viewAllText: {
    fontSize: moderateScale(14),
    color: '#23238E',
    fontWeight: '600',
  },

  appointmentCard: {
    backgroundColor: '#fff',
    borderRadius: scale(16),
    padding: scale(16),
    marginBottom: verticalScale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appointmentImage: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(12),
  },
  appointmentInfo: {
    flex: 1,
    marginLeft: scale(12),
  },
  appointmentDoctor: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: '#222',
  },
  appointmentSpecialty: {
    fontSize: moderateScale(12),
    color: '#666',
    marginTop: verticalScale(2),
  },
  appointmentMeta: {
    flexDirection: 'row',
    marginTop: verticalScale(6),
  },
  statusBadge: {
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: scale(6),
  },
  onlineBadge: {
    backgroundColor: '#E8F4FF',
  },
  offlineBadge: {
    backgroundColor: '#FFF0E8',
  },
  statusText: {
    fontSize: moderateScale(10),
    fontWeight: '600',
    color: '#23238E',
  },

  appointmentDetails: {
    flexDirection: 'row',
    marginTop: verticalScale(12),
    paddingTop: verticalScale(12),
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: scale(20),
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: moderateScale(12),
    color: '#666',
    marginLeft: scale(6),
  },

  appointmentActions: {
    flexDirection: 'row',
    marginTop: verticalScale(12),
    gap: scale(12),
  },
  chatActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(10),
    borderRadius: scale(10),
    borderWidth: 1,
    borderColor: '#23238E',
    gap: scale(6),
  },
  chatActionText: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: '#23238E',
  },
  joinCallBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(10),
    borderRadius: scale(10),
    backgroundColor: '#23238E',
    gap: scale(6),
  },
  joinCallText: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: '#fff',
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(12),
    paddingTop: verticalScale(12),
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  locationText: {
    fontSize: moderateScale(12),
    color: '#666',
    marginLeft: scale(6),
  },

  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: verticalScale(12),
    gap: scale(12),
  },
  quickActionCard: {
    width: wp(43.5),
    backgroundColor: '#fff',
    borderRadius: scale(12),
    padding: scale(16),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionText: {
    fontSize: moderateScale(12),
    color: '#222',
    fontWeight: '500',
    marginTop: verticalScale(8),
  },
  loadingContainer: {
    padding: scale(30),
    alignItems: 'center',
  },
  emptyAppointments: {
    backgroundColor: '#fff',
    borderRadius: scale(14),
    padding: scale(24),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: moderateScale(14),
    color: '#9CA3AF',
    marginTop: verticalScale(12),
  },
  bookNowBtn: {
    marginTop: verticalScale(16),
    backgroundColor: '#23238E',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(10),
    borderRadius: scale(20),
  },
  bookNowText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: moderateScale(13),
  },
});
