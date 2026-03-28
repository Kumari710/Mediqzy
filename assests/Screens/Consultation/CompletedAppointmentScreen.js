import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, StatusBar } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import { getOrderById } from '../../Utils/firebaseDatabase';

export default function CompletedAppointmentScreen({ navigation, route }) {
  const { appointmentId, appointment: initialAppointment } = route?.params || {};
  const [appointment, setAppointment] = useState(initialAppointment || {});
  const [loading, setLoading] = useState(!initialAppointment && !!appointmentId);

  useEffect(() => {
    if (appointmentId && !initialAppointment) {
      fetchAppointment(appointmentId);
    }
  }, [appointmentId]);

  const fetchAppointment = async (aid) => {
    setLoading(true);
    const result = await getOrderById(aid);
    if (result.success) {
      setAppointment(result.data);
    }
    setLoading(false);
  };

  const handleDownloadReport = () => {
    navigation.navigate('ViewLabReportScreen', { report: appointment });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F8F8' }}>
        <ActivityIndicator size="large" color="#23238E" />
        <Text style={{ marginTop: 10, color: '#666' }}>Fetching summary...</Text>
      </View>
    );
  }

  // Sample data for sections not in DB
  const reviews = [
    { id: '1', name: 'Priya Anand', rating: '4.5', comment: 'lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document', image: 'https://i.pravatar.cc/150?u=priya' },
    { id: '2', name: 'Anand Kumar', rating: '4.5', comment: 'lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document', image: 'https://i.pravatar.cc/150?u=anand' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={moderateScale(22)} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Completed Appointments</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: hp(5) }}>
        {/* Doctor Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroCircle}>
            <Image source={require('../../images/IndianDoctor.png')} style={styles.heroImage} />
          </View>
          <TouchableOpacity style={styles.favBtn}>
            <Ionicons name="heart" size={moderateScale(20)} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        {/* Info Content */}
        <View style={styles.contentCard}>
          <View style={styles.drTitleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.drName}>Dr. {appointment.doctor?.name || appointment.doctor || 'Vijayakumar'}</Text>
              <Text style={styles.drSpecialty}>{appointment.doctor?.specialty || appointment.specialty || 'General Physician'}</Text>
            </View>
            <View style={styles.onlineBadge}>
              <Ionicons name="videocam-outline" size={moderateScale(14)} color="#23238E" />
              <Text style={styles.onlineText}>Online</Text>
            </View>
          </View>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={moderateScale(14)} color="#FFD700" />
            <Text style={styles.ratingText}>
              <Text style={{ fontWeight: '700' }}>4.5 ratings</Text> | 300 Reviews
            </Text>
          </View>

          {/* Introduction */}
          <Text style={styles.sectionTitle}>Introduction</Text>
          <Text style={styles.introText}>
            {appointment.doctor?.intro || "Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document or a typeface without relying on meaningful content."}
          </Text>

          {/* Specialization */}
          <View style={styles.specCard}>
            <Text style={styles.specTitle}>Specialization</Text>
            {['General Physician', 'Diabetology', 'Family Medicine'].map((item, idx) => (
              <View key={idx} style={styles.specItem}>
                <View style={styles.bullet} />
                <Text style={styles.specItemText}>{item}</Text>
              </View>
            ))}
          </View>

          {/* Stats boxes */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>11 years</Text>
              <Text style={styles.statLabel}>Experience</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>English, Tamil</Text>
              <Text style={styles.statLabel}>Languages</Text>
            </View>
          </View>

          {/* Registration */}
          <View style={styles.registrationCard}>
            <Text style={styles.regTitle}>Registration</Text>
            <View style={styles.regContent}>
              <Ionicons name="person-outline" size={moderateScale(18)} color="#333" />
              <Text style={styles.regText}>Tamil Nadu Medical Council 2012</Text>
            </View>
          </View>

          {/* Reviews */}
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <TouchableOpacity><Text style={styles.seeAllText}>See all</Text></TouchableOpacity>
          </View>

          {reviews.map((rev) => (
            <View key={rev.id} style={styles.reviewItem}>
              <View style={styles.reviewTop}>
                <Image source={{ uri: rev.image }} style={styles.reviewerAvatar} />
                <View style={{ marginLeft: scale(10) }}>
                  <Text style={styles.reviewerName}>{rev.name}</Text>
                  <View style={styles.revRatingRow}>
                    <Ionicons name="star" size={moderateScale(12)} color="#FFD700" />
                    <Text style={styles.revRatingText}>{rev.rating} ratings</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.reviewComment}>{rev.comment}</Text>
              <View style={styles.reviewDivider} />
            </View>
          ))}
        </View>

        {/* Patient Details Section */}
        <View style={styles.patientDetailsSection}>
          <Text style={styles.patientSectionTitle}>Patients Details</Text>
          {[
            { label: 'Patient Name', value: appointment.patientName || 'Vijay' },
            { label: 'Relation', value: 'Self' },
            { label: 'Date of Birth', value: '05/06/1974' },
            { label: 'Age', value: appointment.patient?.age || '50 yrs' },
            { label: 'Email', value: 'vijay@gmail.com' },
            { label: 'Sex', value: 'Male' },
          ].map((item, idx) => (
            <View key={idx} style={styles.patientDataRow}>
              <Text style={styles.patientDataLabel}>{item.label}</Text>
              <Text style={styles.patientDataSeparator}>:</Text>
              <Text style={styles.patientDataValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        <View style={{ paddingHorizontal: wp(5), marginTop: hp(3) }}>
          <TouchableOpacity style={styles.downloadBtn} onPress={handleDownloadReport}>
            <Text style={styles.downloadBtnText}>Download Report</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    backgroundColor: '#fff',
  },
  backBtn: {
    width: scale(36),
    height: scale(36),
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: moderateScale(17),
    fontWeight: 'bold',
    color: '#333',
    marginLeft: scale(4),
  },

  // Hero Section
  heroSection: {
    backgroundColor: '#20298A',
    height: hp(30),
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderBottomLeftRadius: scale(30),
    borderBottomRightRadius: scale(30),
    overflow: 'visible',
  },
  heroCircle: {
    width: scale(220),
    height: scale(220),
    borderRadius: scale(110),
    backgroundColor: 'rgba(0, 255, 230, 0.4)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: hp(-5),
  },
  heroImage: {
    width: '90%',
    height: '100%',
    resizeMode: 'contain',
  },
  favBtn: {
    position: 'absolute',
    top: scale(20),
    right: scale(20),
    width: scale(36),
    height: scale(36),
    backgroundColor: '#fff',
    borderRadius: scale(18),
    justifyContent: 'center',
    alignItems: 'center',
  },

  contentCard: {
    marginTop: hp(6),
    paddingHorizontal: wp(6),
  },
  drTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  drName: {
    fontSize: moderateScale(22),
    fontWeight: '800',
    color: '#111',
  },
  drSpecialty: {
    fontSize: moderateScale(16),
    color: '#3A3BA8',
    fontWeight: '700',
    marginTop: scale(2),
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    backgroundColor: '#E8F5FF',
    borderRadius: scale(6),
    gap: scale(4),
  },
  onlineText: {
    fontSize: moderateScale(12),
    color: '#23238E',
    fontWeight: '700',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(1),
    gap: scale(6),
  },
  ratingText: {
    fontSize: moderateScale(13),
    color: '#444',
  },

  sectionTitle: {
    fontSize: moderateScale(15),
    fontWeight: '800',
    color: '#3A3BA8',
    marginTop: hp(2.5),
    marginBottom: hp(1),
  },
  introText: {
    fontSize: moderateScale(12),
    color: '#666',
    lineHeight: moderateScale(18),
  },

  // Specialization
  specCard: {
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: scale(12),
    padding: scale(15),
    marginTop: hp(2),
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  specTitle: {
    fontSize: moderateScale(14),
    fontWeight: '800',
    color: '#3A3BA8',
    marginBottom: hp(1),
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(0.5),
  },
  bullet: {
    width: scale(4),
    height: scale(4),
    borderRadius: 2,
    backgroundColor: '#333',
    marginRight: scale(10),
  },
  specItemText: {
    fontSize: moderateScale(13),
    color: '#333',
    fontWeight: '500',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    marginTop: hp(2),
    gap: scale(15),
  },
  statBox: {
    flex: 1,
    backgroundColor: '#EBEBF7',
    borderRadius: scale(10),
    paddingVertical: hp(1.5),
    alignItems: 'center',
  },
  statValue: {
    fontSize: moderateScale(14),
    fontWeight: '800',
    color: '#3A3BA8',
  },
  statLabel: {
    fontSize: moderateScale(12),
    color: '#3A3BA8',
    marginTop: scale(2),
    fontWeight: '600',
  },

  // Registration
  registrationCard: {
    backgroundColor: '#F7FCFC',
    borderWidth: 1,
    borderColor: '#E8F5F5',
    borderRadius: scale(12),
    padding: scale(15),
    marginTop: hp(2),
  },
  regTitle: {
    fontSize: moderateScale(14),
    fontWeight: '800',
    color: '#3A3BA8',
    marginBottom: scale(12),
  },
  regContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(10),
  },
  regText: {
    fontSize: moderateScale(13),
    color: '#333',
    fontWeight: '500',
  },

  // Reviews
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: hp(1),
  },
  seeAllText: {
    fontSize: moderateScale(11),
    color: '#3A3BA8',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  reviewItem: {
    marginTop: hp(1.5),
  },
  reviewTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewerAvatar: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
  },
  reviewerName: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: '#111',
  },
  revRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  revRatingText: {
    fontSize: moderateScale(10),
    color: '#444',
  },
  reviewComment: {
    fontSize: moderateScale(12),
    color: '#666',
    marginTop: hp(1),
    lineHeight: moderateScale(18),
  },
  reviewDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginTop: hp(1.5),
  },

  // Patient Details
  patientDetailsSection: {
    backgroundColor: '#ECECF5',
    marginTop: hp(3),
    padding: wp(6),
  },
  patientSectionTitle: {
    fontSize: moderateScale(15),
    fontWeight: '800',
    color: '#3A3BA8',
    marginBottom: hp(1.5),
  },
  patientDataRow: {
    flexDirection: 'row',
    marginBottom: hp(0.8),
  },
  patientDataLabel: {
    width: wp(35),
    fontSize: moderateScale(13),
    color: '#444',
    fontWeight: '600',
  },
  patientDataSeparator: {
    width: wp(5),
    fontSize: moderateScale(13),
    color: '#444',
    fontWeight: '600',
  },
  patientDataValue: {
    flex: 1,
    fontSize: moderateScale(13),
    color: '#111',
    fontWeight: '700',
  },

  // Download Btn
  downloadBtn: {
    backgroundColor: '#20298A',
    paddingVertical: hp(2),
    borderRadius: scale(30),
    alignItems: 'center',
  },
  downloadBtnText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: 'bold',
  },
});

