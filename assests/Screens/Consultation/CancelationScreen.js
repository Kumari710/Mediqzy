import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { cancelAppointment } from '../../Utils/firebaseDatabase';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

export default function CancelationScreen({ navigation, route }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const appointment = route?.params?.appointment || {};
  const appointmentId = route?.params?.appointmentId || appointment?.id || appointment?.appointmentId;

  const handleSubmit = async () => {
    if (!reason.trim()) {
      Alert.alert('Error', 'Please provide a reason for cancellation');
      return;
    }

    if (!appointmentId) {
      Alert.alert('Error', 'Appointment ID is missing');
      return;
    }

    setLoading(true);
    try {
      const result = await cancelAppointment(appointmentId, reason);

      if (result.success) {
        Alert.alert(
          'Appointment Cancelled',
          'Your appointment has been cancelled successfully.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('ConsultationScreen'),
            },
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to cancel appointment');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={moderateScale(24)} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cancel Appointment</Text>
      </View>

      <View style={styles.content}>
        {/* Appointment Info */}
        {appointment?.doctor && (
          <View style={styles.appointmentInfo}>
            <Text style={styles.doctorName}>{appointment.doctor?.name || appointment.doctor}</Text>
            <Text style={styles.appointmentDate}>{appointment.date} at {appointment.time}</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Reason for Cancellation</Text>
        <View style={styles.textInputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Please tell us why you're cancelling this appointment..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={10}
            textAlignVertical="top"
            value={reason}
            onChangeText={setReason}
          />
        </View>

        <Text style={styles.noteText}>
          Note: Cancellation may be subject to our cancellation policy.
          Please cancel at least 2 hours before your appointment time.
        </Text>
      </View>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Cancel Appointment</Text>
          )}
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
    paddingTop: hp(5),
    paddingHorizontal: wp(4),
    paddingBottom: hp(2),
    backgroundColor: '#fff',
  },
  headerTitle: { fontSize: moderateScale(18), fontWeight: '600', color: '#222', marginLeft: scale(12) },
  content: {
    flex: 1,
    padding: scale(16),
  },
  appointmentInfo: {
    backgroundColor: '#fff',
    borderRadius: scale(12),
    padding: scale(16),
    marginBottom: verticalScale(20),
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  doctorName: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    color: '#23238E',
  },
  appointmentDate: {
    fontSize: moderateScale(14),
    color: '#666',
    marginTop: verticalScale(4),
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    color: '#222',
    marginBottom: verticalScale(16),
  },
  textInputContainer: {
    backgroundColor: '#fff',
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: scale(16),
    minHeight: verticalScale(200),
  },
  textInput: {
    fontSize: moderateScale(14),
    color: '#222',
    lineHeight: moderateScale(22),
  },
  noteText: {
    fontSize: moderateScale(12),
    color: '#888',
    marginTop: verticalScale(16),
    lineHeight: moderateScale(18),
    fontStyle: 'italic',
  },
  bottomContainer: {
    backgroundColor: '#fff',
    padding: scale(16),
    paddingBottom: hp(4),
  },
  submitBtn: {
    backgroundColor: '#E53935',
    borderRadius: scale(8),
    paddingVertical: verticalScale(16),
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
});
