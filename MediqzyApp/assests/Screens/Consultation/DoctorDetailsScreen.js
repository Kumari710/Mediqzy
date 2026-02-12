import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

export default function DoctorDetailsScreen({ navigation, route }) {
  const doctor = route?.params?.doctor || {
    name: 'Dr. Vijayakumar',
    specialty: 'General Physician',
    exp: '11 years Exp',
    fee: '₹ 300',
    rating: 4.5,
    patients: '1.2k+',
    image: require('../../images/IndianDoctor.png'),
  };
  const bookingType = route?.params?.type || 'digital';

  const reviews = [
    { id: 1, name: 'Ramesh K', rating: 5, comment: 'Very professional and caring doctor. Highly recommended!', date: '2 days ago' },
    { id: 2, name: 'Priya S', rating: 4, comment: 'Good consultation experience. Doctor listened patiently.', date: '1 week ago' },
  ];

  const [showFullAbout, setShowFullAbout] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={moderateScale(24)} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Doctor Profile</Text>
          <TouchableOpacity style={styles.shareBtn}>
            <Ionicons name="share-social-outline" size={moderateScale(24)} color="#23238E" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Doctor Profile Card */}
          <View style={styles.profileCard}>
            <Image source={doctor.image} style={styles.doctorImage} />
            <View style={styles.profileInfo}>
              <Text style={styles.doctorName}>{doctor.name}</Text>
              <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
              <View style={styles.badgeRow}>
                <View style={styles.expBadge}>
                  <Ionicons name="briefcase-outline" size={moderateScale(14)} color="#23238E" />
                  <Text style={styles.expText}>{doctor.exp}</Text>
                </View>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={moderateScale(14)} color="#FFB800" />
                  <Text style={styles.ratingText}>{doctor.rating}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={styles.statIconBox}>
                <Ionicons name="people" size={moderateScale(20)} color="#23238E" />
              </View>
              <Text style={styles.statValue}>{doctor.patients || '1.2k+'}</Text>
              <Text style={styles.statLabel}>Patients</Text>
            </View>
            <View style={styles.statItem}>
              <View style={styles.statIconBox}>
                <Ionicons name="star" size={moderateScale(20)} color="#FFB800" />
              </View>
              <Text style={styles.statValue}>{doctor.rating}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statItem}>
              <View style={styles.statIconBox}>
                <Ionicons name="chatbubbles" size={moderateScale(20)} color="#4CAF50" />
              </View>
              <Text style={styles.statValue}>500+</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
          </View>

          {/* About Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>About Doctor</Text>
              {doctor.regNo && (
                <View style={styles.regBadge}>
                  <Text style={styles.regText}>Reg No: {doctor.regNo}</Text>
                </View>
              )}
            </View>
            <Text style={styles.aboutText} numberOfLines={showFullAbout ? undefined : 3}>
              {doctor.about || `${doctor.name} is a highly experienced ${doctor.specialty} with over ${doctor.exp} of clinical practice. Specializes in treating common ailments, chronic diseases, and preventive healthcare.`}
            </Text>
            <TouchableOpacity onPress={() => setShowFullAbout(!showFullAbout)}>
              <Text style={styles.readMoreBtn}>{showFullAbout ? 'Read Less' : 'Read More'}</Text>
            </TouchableOpacity>
          </View>

          {/* Education */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education & Certification</Text>
            <View style={styles.educationItem}>
              <Ionicons name="school-outline" size={moderateScale(20)} color="#23238E" />
              <View style={styles.educationInfo}>
                <Text style={styles.educationTitle}>MBBS, MD (General Medicine)</Text>
                <Text style={styles.educationSubtitle}>Madras Medical College, Chennai</Text>
              </View>
            </View>
            <View style={styles.educationItem}>
              <Ionicons name="ribbon-outline" size={moderateScale(20)} color="#23238E" />
              <View style={styles.educationInfo}>
                <Text style={styles.educationTitle}>Fellowship in Internal Medicine</Text>
                <Text style={styles.educationSubtitle}>Apollo Hospitals, Chennai</Text>
              </View>
            </View>
          </View>

          {/* Availability */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Availability</Text>
            <View style={styles.availabilityCard}>
              <View style={styles.availabilityRow}>
                <Ionicons name="calendar-outline" size={moderateScale(18)} color="#23238E" />
                <Text style={styles.availabilityText}>Mon - Sat</Text>
              </View>
              <View style={styles.availabilityRow}>
                <Ionicons name="time-outline" size={moderateScale(18)} color="#23238E" />
                <Text style={styles.availabilityText}>09:00 AM - 07:00 PM</Text>
              </View>
            </View>
          </View>

          {/* Reviews */}
          <View style={styles.section}>
            <View style={styles.reviewHeader}>
              <Text style={styles.sectionTitle}>Patient Reviews</Text>
              <TouchableOpacity onPress={() => navigation.navigate('DoctorReviewsScreen', { doctor })}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>

            </View>
            {reviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewTop}>
                  <View style={styles.reviewerAvatar}>
                    <Text style={styles.reviewerInitial}>{review.name.charAt(0)}</Text>
                  </View>
                  <View style={styles.reviewerInfo}>
                    <Text style={styles.reviewerName}>{review.name}</Text>
                    <Text style={styles.reviewDate}>{review.date}</Text>
                  </View>
                  <View style={styles.reviewRating}>
                    <Ionicons name="star" size={moderateScale(14)} color="#FFB800" />
                    <Text style={styles.reviewRatingText}>{review.rating}</Text>
                  </View>
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Bottom Bar */}
        <View style={styles.bottomBar}>
          <View style={styles.feeSection}>
            <Text style={styles.feeLabel}>Consultation Fee</Text>
            <Text style={styles.feeAmount}>{doctor.fee}</Text>
          </View>
          <TouchableOpacity
            style={styles.bookBtn}
            onPress={() => navigation.navigate('DoctorBookingScreen', {
              doctor: doctor,
              type: bookingType === 'digital' ? 'online' : 'hospital'
            })}
          >
            <Text style={styles.bookBtnText}>Book Appointment</Text>
          </TouchableOpacity>
        </View>
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
  shareBtn: {
    width: scale(40),
    padding: scale(4),
    alignItems: 'flex-end',
  },
  headerTitle: { fontSize: moderateScale(18), fontWeight: '700', color: '#222' },
  scrollContent: { paddingBottom: hp(15) },

  profileCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: scale(16),
    padding: scale(16),
    borderRadius: scale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  doctorImage: {
    width: scale(100),
    height: scale(100),
    borderRadius: scale(16),
  },
  profileInfo: {
    flex: 1,
    marginLeft: scale(16),
    justifyContent: 'center',
  },
  doctorName: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: '#222',
  },
  doctorSpecialty: {
    fontSize: moderateScale(14),
    color: '#666',
    marginTop: verticalScale(4),
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: verticalScale(12),
    gap: scale(10),
  },
  expBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F4FF',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(6),
    borderRadius: scale(8),
  },
  expText: {
    fontSize: moderateScale(12),
    color: '#23238E',
    fontWeight: '600',
    marginLeft: scale(4),
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E0',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(6),
    borderRadius: scale(8),
  },
  ratingText: {
    fontSize: moderateScale(12),
    color: '#222',
    fontWeight: '600',
    marginLeft: scale(4),
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    marginHorizontal: wp(4),
    padding: scale(16),
    borderRadius: scale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statIconBox: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  statValue: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#222',
  },
  statLabel: {
    fontSize: moderateScale(12),
    color: '#888',
    marginTop: verticalScale(2),
  },

  section: {
    backgroundColor: '#fff',
    marginHorizontal: wp(4),
    marginTop: verticalScale(16),
    padding: scale(16),
    borderRadius: scale(16),
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#222',
    marginBottom: verticalScale(12),
  },
  aboutText: {
    fontSize: moderateScale(14),
    color: '#666',
    lineHeight: moderateScale(22),
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  regBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: scale(6),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  regText: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    color: '#475569',
  },
  readMoreBtn: {
    fontSize: moderateScale(14),
    color: '#23238E',
    fontWeight: '700',
    marginTop: verticalScale(8),
  },

  educationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: verticalScale(12),
  },
  educationInfo: {
    marginLeft: scale(12),
    flex: 1,
  },
  educationTitle: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#222',
  },
  educationSubtitle: {
    fontSize: moderateScale(12),
    color: '#888',
    marginTop: verticalScale(2),
  },

  availabilityCard: {
    backgroundColor: '#F5F7FA',
    padding: scale(16),
    borderRadius: scale(12),
    gap: verticalScale(10),
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityText: {
    fontSize: moderateScale(14),
    color: '#222',
    marginLeft: scale(10),
    fontWeight: '500',
  },

  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: moderateScale(14),
    color: '#23238E',
    fontWeight: '600',
  },
  reviewCard: {
    backgroundColor: '#F5F7FA',
    padding: scale(12),
    borderRadius: scale(12),
    marginBottom: verticalScale(10),
  },
  reviewTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  reviewerAvatar: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: '#23238E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewerInitial: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#fff',
  },
  reviewerInfo: {
    flex: 1,
    marginLeft: scale(10),
  },
  reviewerName: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#222',
  },
  reviewDate: {
    fontSize: moderateScale(12),
    color: '#888',
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E0',
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: scale(6),
  },
  reviewRatingText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: '#222',
    marginLeft: scale(4),
  },
  reviewComment: {
    fontSize: moderateScale(13),
    color: '#555',
    lineHeight: moderateScale(20),
  },

  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: wp(6),
    paddingVertical: hp(2),
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  feeSection: {},
  feeLabel: {
    fontSize: moderateScale(12),
    color: '#888',
  },
  feeAmount: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: '#23238E',
  },
  bookBtn: {
    backgroundColor: '#23238E',
    borderRadius: scale(12),
    paddingVertical: verticalScale(14),
    paddingHorizontal: wp(8),
  },
  bookBtnText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#fff',
  },
});
