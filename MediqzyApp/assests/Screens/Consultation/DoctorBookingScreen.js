import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { Calendar } from 'react-native-calendars';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

const timeSlots = {
  Morning: ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'],
  Afternoon: ['12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM'],
  Evening: ['04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM'],
};

export default function DoctorBookingScreen({ navigation, route }) {
  const doctor = route?.params?.doctor || {
    name: 'Dr. Suresh Tanmani',
    specialty: 'General Physician',
    exp: '10 Years',
    regNo: 'TMC-98765',
    certification: 'MBBS, MD (Internal Medicine)',
    about: 'Dr. Suresh Tanmani is a highly experienced General Physician...',
    rating: '94%',
    location: 'Apollo Hospitals, Valechery',
    image: require('../../images/IndianDoctor.png'),
    fee: 'Rs. 300',
  };

  // Parse price if it's a string like "₹ 300"
  const doctorPrice = (typeof doctor.fee === 'string' && doctor.fee)
    ? parseInt(doctor.fee.replace(/[^\d]/g, ''))
    : (doctor.price ?? 300);

  const bookingType = route?.params?.type || 'online';

  // Use today's date as default
  const today = new Date();
  const defaultDate = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD

  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [showFullAbout, setShowFullAbout] = useState(false);
  const [showFullCertification, setShowFullCertification] = useState(false);

  // Mark selected date
  const markedDates = {
    [selectedDate]: { selected: true, selectedColor: '#F97316' },
  };

  const isToday = selectedDate === defaultDate;
  const currentHour = new Date().getHours();
  const currentMinute = new Date().getMinutes();

  const isSlotPast = (slotStr) => {
    if (!isToday) return false;

    // Parse slot string like "09:30 AM"
    const [time, period] = slotStr.split(' ');
    let [hour, minute] = time.split(':').map(Number);

    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;

    if (hour < currentHour) return true;
    if (hour === currentHour && minute <= currentMinute) return true;

    return false;
  };

  const formatDateForDisplay = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${day}.${month}.${year}`;
  };

  // Get formatted date for appointment data
  const getFormattedFullDate = (dateString) => {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={moderateScale(24)} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Appointment</Text>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: hp(12) }}>
        {/* Doctor Info Card */}
        <View style={styles.doctorCard}>
          <View style={styles.doctorHeaderRow}>
            <Image source={doctor.image || require('../../images/IndianDoctor.png')} style={styles.doctorAvatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.doctorName}>{doctor.name}</Text>
              <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
              <Text style={styles.experienceText}>{doctor.exp || doctor.experience}</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Ionicons name="thumbs-up" size={moderateScale(14)} color="#4CAF50" />
              <Text style={styles.ratingText}>{doctor.rating || '94%'}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.certificationContainer}
            activeOpacity={0.7}
            onPress={() => setShowFullCertification(!showFullCertification)}
          >
            <Text
              style={styles.certificationText}
              numberOfLines={showFullCertification ? undefined : 1}
              ellipsizeMode="tail"
            >
              Certification: <Text style={styles.certificationValue}>{doctor.certification}</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Consultation Type */}
        <View style={styles.consultationRow}>
          <Text style={styles.consultationType}>
            {bookingType === 'online' ? 'Online Consultation' : 'Hospital Consultation'}
          </Text>
          <Text style={styles.priceText}>Rs. {doctorPrice}</Text>
        </View>

        {/* Apollo Labs Card - Only for Hospital Visit */}
        {bookingType !== 'online' && (
          <View style={styles.apolloCard}>
            <Image source={require('../../images/apollo.png')} style={styles.apolloLogo} />
            <View style={styles.apolloInfo}>
              <Text style={styles.apolloName}>Apollo Labs</Text>
              <Text style={styles.apolloAddress}>T.nagar, Chennai 600017</Text>
            </View>
            <TouchableOpacity style={styles.apolloIconBtn}>
              <Ionicons name="call-outline" size={moderateScale(20)} color="#23238E" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.apolloLocationBtn}>
              <Ionicons name="location" size={moderateScale(20)} color="#E53935" />
            </TouchableOpacity>
          </View>
        )}

        {/* Select Date */}
        <Text style={styles.sectionTitle}>Select Date</Text>

        {/* Calendar */}
        <View style={styles.calendarContainer}>
          <Calendar
            current={defaultDate}
            minDate={defaultDate}
            onDayPress={(day) => {
              setSelectedDate(day.dateString);
              setSelectedTimeSlot(null);
            }}
            markedDates={markedDates}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#222',
              selectedDayBackgroundColor: '#F97316',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#F97316',
              dayTextColor: '#222',
              textDisabledColor: '#d9e1e8',
              dotColor: '#23238E',
              selectedDotColor: '#ffffff',
              arrowColor: '#F97316',
              monthTextColor: '#888888', // Light gray for month title
              textDayFontWeight: '400',
              textMonthFontWeight: '600',
              textDayHeaderFontWeight: '600',
              textDayFontSize: moderateScale(14),
              textMonthFontSize: moderateScale(16),
              textDayHeaderFontSize: moderateScale(14),
            }}
            style={styles.calendar}
          />
        </View>

        {/* Available Time Slots */}
        <Text style={styles.sectionTitle}>Available Time Slot</Text>

        {Object.entries(timeSlots).map(([period, slots]) => (
          <View key={period} style={styles.timePeriodSection}>
            <Text style={styles.timePeriodTitle}>{period}</Text>
            <View style={styles.timeSlotsRow}>
              {slots.map((slot) => {
                const isPast = isSlotPast(slot);
                return (
                  <TouchableOpacity
                    key={slot}
                    style={[
                      styles.timeSlot,
                      selectedTimeSlot === slot && styles.selectedTimeSlot,
                      isPast && { backgroundColor: '#F0F0F0', borderColor: '#E0E0E0' }
                    ]}
                    onPress={() => !isPast && setSelectedTimeSlot(slot)}
                    disabled={isPast}
                  >
                    <Text style={[
                      styles.timeSlotText,
                      selectedTimeSlot === slot && styles.selectedTimeSlotText,
                      isPast && { color: '#CCC' }
                    ]}>
                      {slot}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {/* About Doctor */}
        <Text style={styles.sectionTitle}>About Doctor</Text>

        {/* Description */}
        <View style={styles.aboutCard}>
          <Text style={styles.aboutCardTitle}>Description</Text>
          <Text style={styles.aboutCardText} numberOfLines={showFullAbout ? undefined : 3}>
            {doctor.about || 'Dr. Suresh Tanmani is a highly experienced General Physician with over 10 years of clinical practice. Specialist in geriatric care, diabetes management, and preventive medicine.'}
          </Text>
          <TouchableOpacity onPress={() => setShowFullAbout(!showFullAbout)}>
            <Text style={styles.readMoreBtn}>{showFullAbout ? 'Read Less' : 'Read More'}</Text>
          </TouchableOpacity>
        </View>

        {/* Treatments and Procedure */}
        <View style={styles.aboutCard}>
          <Text style={styles.aboutCardTitle}>Treatments and Procedure</Text>
          <Text style={styles.aboutCardText}>
            OBH COMBI is a cough medicine containing, Paracetamol
          </Text>
          <Text style={styles.proceduresTitle}>Procedures Performed</Text>
          <View style={styles.proceduresGrid}>
            {['Procedures', 'Procedures', 'Procedures', 'Procedures', 'Procedures', 'Procedures', 'Procedures'].map((proc, index) => (
              <View key={index} style={styles.procedureItem}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.procedureText}>{proc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Education */}
        <View style={styles.aboutCard}>
          <Text style={styles.aboutCardTitle}>Education</Text>
          <Text style={styles.aboutCardText}>
            {doctor.certification}
          </Text>
        </View>

        {/* Registration */}
        <View style={styles.aboutCard}>
          <Text style={styles.aboutCardTitle}>Registration</Text>
          <Text style={styles.registrationText}>{doctor.regNo || 'TSMC/FMR/2568**'}</Text>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.bookBtn, !selectedTimeSlot && { backgroundColor: '#CCC' }]}
          disabled={!selectedTimeSlot}
          onPress={() => navigation.navigate('SelectPatientScreen', {
            appointmentData: {
              doctor: doctor.name,
              specialty: doctor.specialty,
              type: bookingType,
              status: bookingType === 'online' ? 'Online' : 'Offline',
              consultationNo: `APPT${Date.now().toString().slice(-7)}`,
              date: formatDateForDisplay(selectedDate),
              fullDate: getFormattedFullDate(selectedDate),
              time: selectedTimeSlot,
              location: doctor.location || 'Apollo Hospitals, Velachery',
              fee: doctorPrice,
              bookingFee: 40,
            }
          })}
        >
          <Text style={styles.bookBtnText}>
            {bookingType === 'online' ? 'Book Digital Consultation' : 'Book Hospital Visit'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: hp(2),
    paddingHorizontal: wp(4),
    paddingBottom: hp(2),
    backgroundColor: '#fff',
  },
  headerTitle: { fontSize: moderateScale(18), fontWeight: '600', color: '#222', marginLeft: scale(12) },
  doctorCard: {
    backgroundColor: '#fff',
    marginHorizontal: wp(4),
    marginTop: verticalScale(16),
    padding: scale(16),
    borderRadius: scale(16),
  },
  doctorHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  doctorAvatar: {
    width: scale(70),
    height: scale(70),
    borderRadius: scale(35),
    marginRight: scale(12),
  },
  doctorName: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: '#23238E',
  },
  doctorSpecialty: {
    fontSize: moderateScale(14),
    color: '#888',
    marginTop: verticalScale(2),
  },
  experienceText: {
    fontSize: moderateScale(13),
    color: '#23238E',
    marginTop: verticalScale(4),
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: scale(12),
    gap: scale(4),
  },
  ratingText: {
    fontSize: moderateScale(12),
    color: '#4CAF50',
    fontWeight: '600',
  },
  certificationContainer: {
    marginTop: verticalScale(12),
    backgroundColor: '#F8FAFC',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(8),
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  certificationText: {
    fontSize: moderateScale(12),
    color: '#64748B',
  },
  certificationValue: {
    fontWeight: '600',
    color: '#334155',
  },
  consultationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: wp(4),
    marginTop: verticalScale(12),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(14),
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  consultationType: {
    fontSize: moderateScale(14),
    color: '#23238E',
    fontWeight: '500',
  },
  priceText: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    color: '#222',
  },
  apolloCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: wp(4),
    marginTop: verticalScale(12),
    padding: scale(16),
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  apolloLogo: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(8),
    resizeMode: 'contain',
  },
  apolloInfo: {
    flex: 1,
    marginLeft: scale(12),
  },
  apolloName: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: '#222',
  },
  apolloAddress: {
    fontSize: moderateScale(12),
    color: '#888',
    marginTop: verticalScale(2),
  },
  apolloIconBtn: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(8),
    backgroundColor: '#F5F5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(8),
  },
  apolloLocationBtn: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(8),
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    color: '#222',
    marginHorizontal: wp(4),
    marginTop: verticalScale(24),
    marginBottom: verticalScale(12),
  },
  calendarContainer: {
    backgroundColor: '#fff',
    marginHorizontal: wp(4),
    borderRadius: scale(16),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: scale(10), // Added padding for better spacing
  },
  calendar: {
    borderRadius: scale(16),
  },
  timePeriodSection: {
    marginHorizontal: wp(4),
    marginBottom: verticalScale(16),
  },
  timePeriodTitle: {
    fontSize: moderateScale(14),
    color: '#555',
    marginBottom: verticalScale(8),
  },
  timeSlotsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(8),
  },
  timeSlot: {
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(10),
    borderRadius: scale(8),
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedTimeSlot: {
    backgroundColor: '#23238E',
    borderColor: '#23238E',
  },
  timeSlotText: {
    fontSize: moderateScale(12),
    color: '#555',
  },
  selectedTimeSlotText: {
    color: '#fff',
    fontWeight: '600',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: scale(16),
    paddingBottom: hp(4),
  },
  bookBtn: {
    backgroundColor: '#23238E',
    borderRadius: scale(8),
    paddingVertical: verticalScale(16),
    alignItems: 'center',
  },
  bookBtnText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  aboutCard: {
    backgroundColor: '#fff',
    marginHorizontal: wp(4),
    marginBottom: verticalScale(12),
    padding: scale(16),
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  aboutCardTitle: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    color: '#222',
    marginBottom: verticalScale(8),
  },
  aboutCardText: {
    fontSize: moderateScale(14),
    color: '#666',
    lineHeight: moderateScale(22),
  },
  readMoreBtn: {
    color: '#23238E',
    fontWeight: '700',
    fontSize: moderateScale(14),
    marginTop: verticalScale(8),
  },
  proceduresTitle: {
    fontSize: moderateScale(15),
    fontWeight: 'bold',
    color: '#222',
    marginTop: verticalScale(16),
    marginBottom: verticalScale(12),
  },
  proceduresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  procedureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '33%',
    marginBottom: verticalScale(8),
  },
  bulletPoint: {
    fontSize: moderateScale(16),
    color: '#222',
    marginRight: scale(6),
  },
  procedureText: {
    fontSize: moderateScale(13),
    color: '#222',
  },
  registrationText: {
    fontSize: moderateScale(14),
    color: '#888',
  },
});
