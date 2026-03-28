import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import { onDataChange, cancelAppointment, isFutureAppointment } from '../../Utils/firebaseDatabase';
import { getCurrentUser } from '../../Utils/firebaseAuth';
import { shareAppointment } from '../../Utils/shareService';

export default function AppointmentDetailsScreen({ navigation, route }) {
  const { appointment: initialAppointment, appointmentId: passedAppointmentId } = route?.params || {};

  const appointmentId = passedAppointmentId || initialAppointment?.firebaseKey || initialAppointment?.id;

  const [appointment, setAppointment] = useState(() => {
    if (!initialAppointment) return {};
    return {
      ...initialAppointment,
      id: appointmentId,
      firebaseKey: appointmentId,
    };
  });
  const [loading, setLoading] = useState(!initialAppointment);
  const [cancelling, setCancelling] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [showFullAbout, setShowFullAbout] = useState(false);

  useEffect(() => {
    if (!appointmentId) return;

    const user = getCurrentUser();
    if (!user) return;

    const unsubscribe = onDataChange(`appointments/${user.uid}/${appointmentId}`, (data) => {
      if (data) {
        setAppointment({
          ...data,
          id: appointmentId,
          firebaseKey: appointmentId
        });
      }
      setLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [appointmentId]);

  const isOnline = appointment.type?.toLowerCase() === 'online' || appointment.status === 'Online' || appointment.consultationType === 'Online';
  const isFuture = isFutureAppointment(appointment);
  const isUpcoming = (appointment.status === 'upcoming' || appointment.status === 'Online' || appointment.status === 'Offline') && isFuture;
  const isCancelled = appointment.status === 'cancelled';
  const isCompleted = appointment.status === 'completed';
  const isExpired = (appointment.status === 'upcoming' || appointment.status === 'Online' || appointment.status === 'Offline') && !isFuture;
  const isMissed = isExpired || appointment.status === 'missed';

  const handleCancelAppointment = () => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment? This action cannot be undone.',
      [
        { text: 'No, Keep It', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            setCancelling(true);
            try {
              const result = await cancelAppointment(appointmentId || appointment.firebaseKey || appointment.id, 'User cancelled');
              if (result.success) {
                Alert.alert('Appointment Cancelled', 'Your appointment has been cancelled successfully.', [
                  { text: 'OK', onPress: () => navigation.goBack() },
                ]);
              } else {
                Alert.alert('Error', result.error || 'Failed to cancel appointment');
              }
            } catch (error) {
              Alert.alert('Error', 'Something went wrong');
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  const getStatusStyle = () => {
    if (isUpcoming) {
      if (isOnline) {
        return { bg: '#22C55E', text: '#fff', label: 'Online' };
      }
      return { bg: '#F97316', text: '#fff', label: 'Offline' };
    }
    if (isMissed) {
      return { bg: '#fff', text: '#1E3A8A', label: 'Missed', border: '#1E3A8A' };
    }
    if (isCompleted) {
      return { bg: '#DCFCE7', text: '#16A34A', label: 'Completed' };
    }
    if (isCancelled) {
      return { bg: '#FEE2E2', text: '#DC2626', label: 'Cancelled' };
    }
    return { bg: '#F3F4F6', text: '#6B7280', label: 'Pending' };
  };

  const statusStyle = getStatusStyle();

  const handleShare = async () => {
    setSharing(true);
    try {
      const result = await shareAppointment({
        doctorName: appointment.doctor?.name || 'Doctor',
        specialty: appointment.doctor?.specialty || 'Specialist',
        date: appointment.date,
        time: appointment.time,
        type: appointment.type,
        bookingId: appointment.bookingId || appointmentId,
      });
      if (!result.success && result.error) {
        Alert.alert('Share Failed', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share appointment');
    } finally {
      setSharing(false);
    }
  };

  const checkIsMeetingLive = () => {
    if (!appointment.date || !appointment.time) return false;
    try {
      const normalizedDate = appointment.date.replace(/\//g, '.');
      const dateParts = normalizedDate.split('.');
      if (dateParts.length !== 3) return false;
      const day = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]);
      const yearShort = parseInt(dateParts[2]);
      const year = yearShort < 100 ? 2000 + yearShort : yearShort;

      const timeParts = appointment.time.split(' ');
      if (timeParts.length < 2) return false;
      const [timeStr, period] = timeParts;
      const [hourStr, minuteStr] = timeStr.split(':');
      let hours = parseInt(hourStr);
      const minutes = parseInt(minuteStr);

      if (period?.toUpperCase() === 'PM' && hours !== 12) hours += 12;
      if (period?.toUpperCase() === 'AM' && hours === 12) hours = 0;

      const apptDate = new Date(year, month - 1, day, hours, minutes);
      const now = new Date();
      const diffInMinutes = (now - apptDate) / (1000 * 60);
      return diffInMinutes >= -15 && diffInMinutes <= 45;
    } catch (e) {
      return false;
    }
  };

  const isLive = isOnline && isUpcoming && checkIsMeetingLive();

  const formatApptDate = (dateStr) => {
    if (!dateStr) return '21.05.25';
    return dateStr.replace(/\//g, '.');
  };

  const doctorImage = appointment.doctorImage || appointment.doctor?.image || appointment.image || null;

  const formatBookingDate = (createdAt) => {
    if (appointment.bookingDate) return appointment.bookingDate;
    if (!createdAt) return '5th May, 2025';
    try {
      const date = new Date(createdAt);
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) {
      return '5th May, 2025';
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#1A1A80" />
        <Text style={styles.loadingText}>Loading appointment...</Text>
      </View>
    );
  }

  if (!appointment || (!appointment.doctor && !appointment.doctorName)) {
    return (
      <View style={[styles.container, styles.centered]}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <Ionicons name="alert-circle-outline" size={moderateScale(64)} color="#DC2626" />
        <Text style={[styles.loadingText, { fontWeight: 'bold', color: '#222', fontSize: moderateScale(18) }]}>Appointment Not Found</Text>
        <TouchableOpacity
          style={styles.goBackBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.goBackText}>Go Back</Text>
        </TouchableOpacity>
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
          <Text style={styles.headerTitle}>Appointment Details</Text>
          <View style={{ width: scale(40) }} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {/* Main Card */}
          <View style={styles.mainCard}>
            {/* Doctor Row */}
            <View style={styles.doctorRow}>
              <Image source={doctorImage ? { uri: doctorImage } : require('../../images/IndianDoctor.png')} style={styles.doctorImage} />
              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>{appointment.doctor?.name || appointment.doctorName || 'Dr. Suresh Tanmani'}</Text>
                <Text style={styles.doctorSpecialty}>{appointment.doctor?.specialty || appointment.specialty || 'ENT Specialist'}</Text>

                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>{appointment.doctor?.exp || '10 YEARS'} Exp</Text>
                  {appointment.doctor?.regNo && (
                    <>
                      <View style={styles.metaDot} />
                      <Text style={styles.metaText}>Reg: {appointment.doctor.regNo}</Text>
                    </>
                  )}
                </View>
              </View>
              <View style={[
                styles.statusBadge,
                {
                  backgroundColor: statusStyle.bg,
                  borderWidth: statusStyle.border ? 1.5 : 0,
                  borderColor: statusStyle.border || 'transparent'
                }
              ]}>
                <Text style={[styles.statusText, { color: statusStyle.text }]}>
                  {statusStyle.label}
                </Text>
              </View>
            </View>

            {/* Details Grid */}
            <View style={styles.detailsGrid}>
              <View style={styles.detailCol}>
                <Text style={styles.detailLabel}>Patient name</Text>
                <Text style={styles.detailValue}>{appointment.patientName || 'Shivakumar'}</Text>
              </View>
              <View style={styles.detailCol}>
                <Text style={styles.detailLabel}>Consultation No.</Text>
                <Text style={styles.detailValue}>{(appointment.consultationId || appointmentId || appointment.id || 'RK9755472').slice(-9).toUpperCase()}</Text>
              </View>
              <View style={styles.detailCol}>
                <Text style={styles.detailLabel}>Date</Text>
                <View style={styles.dateBadge}>
                  <Text style={styles.badgeText}>{formatApptDate(appointment.date)}</Text>
                </View>
              </View>
              <View style={styles.detailCol}>
                <Text style={styles.detailLabel}>Time</Text>
                <View style={styles.timeBadge}>
                  <Text style={styles.badgeText}>{appointment.time || '11:00 AM'}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Doctor Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Doctor Profile</Text>
            </View>
            <Text style={styles.aboutText} numberOfLines={showFullAbout ? undefined : 3}>
              {appointment.doctor?.about ||
                `${appointment.doctor?.name || 'Dr. Suresh Tanmani'} is a highly experienced ${appointment.doctor?.specialty || 'General Specialist'} with deep expertise in clinical practice. Dedicated to providing patient-centric care and thorough consultations.`
              }
            </Text>
            <TouchableOpacity onPress={() => setShowFullAbout(!showFullAbout)}>
              <Text style={styles.readMoreBtn}>{showFullAbout ? 'Read Less' : 'Read More'}</Text>
            </TouchableOpacity>
          </View>

          {/* Booking Date */}
          <View style={styles.bookingDateRow}>
            <Ionicons name="calendar-outline" size={moderateScale(18)} color="#666" />
            <Text style={styles.bookingDateText}>Booking Date : <Text style={styles.bookingDateValue}>{formatBookingDate(appointment.createdAt)}</Text></Text>
          </View>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            {/* Reschedule - For Missed or Upcoming */}
            {(isMissed || isUpcoming) && (
              <TouchableOpacity
                style={styles.rescheduleBtn}
                onPress={() => navigation.navigate('RescheduleAppointmentScreen', {
                  appointment,
                  appointmentId: appointmentId || appointment.firebaseKey || appointment.id
                })}
              >
                <Text style={styles.rescheduleText}>Reschedule</Text>
              </TouchableOpacity>
            )}

            {/* Cancel - Only for Upcoming */}
            {isUpcoming && (
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={handleCancelAppointment}
                disabled={cancelling}
              >
                <Text style={styles.cancelText}>{cancelling ? 'Cancelling...' : 'Cancel Booking'}</Text>
              </TouchableOpacity>
            )}

            {/* Completed Actions */}
            {isCompleted && (
              <View style={styles.completedActions}>
                <TouchableOpacity
                  style={styles.actionBtnOutline}
                  onPress={() => navigation.navigate('CompletedAppointmentScreen', {
                    appointmentId: appointmentId || appointment.id,
                    appointment
                  })}
                >
                  <Ionicons name="medical-outline" size={moderateScale(18)} color="#1E3A8A" />
                  <Text style={styles.actionBtnText}>Summary</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionBtnOutline}
                  onPress={() => navigation.navigate('ConsultationBillScreen', {
                    appointmentId: appointmentId || appointment.id,
                    appointment
                  })}
                >
                  <Ionicons name="receipt-outline" size={moderateScale(18)} color="#1E3A8A" />
                  <Text style={styles.actionBtnText}>View Bill</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  safeArea: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center', flex: 1 },
  loadingText: { marginTop: 12, color: '#666', fontSize: moderateScale(14) },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    backgroundColor: '#fff',
  },
  backBtn: { padding: scale(4) },
  headerTitle: { fontSize: moderateScale(18), fontWeight: '600', color: '#222' },

  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: wp(4), paddingBottom: hp(5) },

  // Main Card
  mainCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
    marginTop: verticalScale(10),
  },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(10),
  },
  doctorImage: {
    width: scale(42),
    height: scale(42),
    borderRadius: scale(8),
    backgroundColor: '#E5E7EB',
  },
  doctorInfo: { flex: 1, marginLeft: scale(10) },
  doctorName: { fontSize: moderateScale(15), fontWeight: '700', color: '#1E3A8A' },
  doctorSpecialty: { fontSize: moderateScale(13), color: '#666', marginTop: 1 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(4),
  },
  metaText: {
    fontSize: moderateScale(11),
    color: '#94A3B8',
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#94A3B8',
    marginHorizontal: scale(6),
  },
  statusBadge: {
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: scale(5),
  },
  statusText: { fontSize: moderateScale(11), fontWeight: '600' },

  // Details Grid
  detailsGrid: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: scale(10),
    marginHorizontal: scale(2),
    marginBottom: scale(2),
    borderRadius: scale(10),
  },
  detailCol: { flex: 1, alignItems: 'center' },
  detailLabel: { fontSize: moderateScale(9), color: '#888', marginBottom: verticalScale(4) },
  detailValue: { fontSize: moderateScale(10), fontWeight: '600', color: '#333' },
  dateBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: scale(6),
    paddingVertical: verticalScale(3),
    borderRadius: scale(4),
  },
  timeBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: scale(6),
    paddingVertical: verticalScale(3),
    borderRadius: scale(4),
  },
  badgeText: { color: '#fff', fontSize: moderateScale(9), fontWeight: '600' },

  // Booking Date
  bookingDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(16),
    gap: 8,
  },
  bookingDateText: { fontSize: moderateScale(13), color: '#444' },
  bookingDateValue: { fontWeight: '700', color: '#1E3A8A' },

  // Profile Section
  profileSection: {
    backgroundColor: '#fff',
    marginTop: verticalScale(16),
    padding: scale(16),
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#1E3A8A',
  },
  aboutText: {
    fontSize: moderateScale(14),
    color: '#64748B',
    lineHeight: 22,
  },
  readMoreBtn: {
    fontSize: moderateScale(14),
    color: '#1E3A8A',
    fontWeight: '700',
    marginTop: verticalScale(8),
  },

  // Actions
  actionsContainer: {
    marginTop: verticalScale(24),
    gap: verticalScale(10),
  },
  rescheduleBtn: {
    backgroundColor: '#1E3A8A',
    borderRadius: scale(8),
    paddingVertical: verticalScale(14),
    alignItems: 'center',
  },
  rescheduleText: { color: '#fff', fontSize: moderateScale(15), fontWeight: '600' },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: verticalScale(8),
  },
  cancelText: { color: '#9CA3AF', fontSize: moderateScale(14), fontWeight: '500' },

  completedActions: {
    flexDirection: 'row',
    gap: scale(10),
  },
  actionBtnOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1E3A8A',
    borderRadius: scale(8),
    paddingVertical: verticalScale(12),
    gap: 5,
  },
  actionBtnText: { color: '#1E3A8A', fontSize: moderateScale(13), fontWeight: '600' },

  goBackBtn: {
    backgroundColor: '#1E3A8A',
    borderRadius: scale(10),
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(40),
    marginTop: verticalScale(20),
  },
  goBackText: { color: '#fff', fontSize: moderateScale(15), fontWeight: '600' },
});

