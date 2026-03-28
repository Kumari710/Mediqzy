import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Calendar } from 'react-native-calendars';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import { rescheduleAppointment } from '../../Utils/firebaseDatabase';

// Available time slots
const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
    '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
    '06:00 PM', '06:30 PM', '07:00 PM',
];

export default function RescheduleAppointmentScreen({ navigation, route }) {
    const { appointment, appointmentId } = route?.params || {};
    const today = new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState(today);
    const [selectedTime, setSelectedTime] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleReschedule = async () => {
        if (!selectedDate || !selectedTime) {
            Alert.alert('Required', 'Please select a new date and time for your appointment.');
            return;
        }

        // Format date for storage (DD.MM.YY)
        const d = new Date(selectedDate);
        const formattedDate = `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear().toString().slice(-2)}`;

        // Get the correct appointment ID (Firebase key) from multiple possible sources
        const idToUse = appointmentId ||
            appointment?.firebaseKey ||
            appointment?.id ||
            appointment?.key ||
            appointment?.appointmentId;


        // Debug log all available IDs
        console.log('[Reschedule] Available IDs:', {
            appointmentId,
            'appointment.firebaseKey': appointment?.firebaseKey,
            'appointment.id': appointment?.id,
            'appointment.key': appointment?.key,
            'appointment.appointmentId': appointment?.appointmentId,
            'using': idToUse,
        });

        if (!idToUse) {
            Alert.alert('Error', 'Could not find appointment ID. Please go back and try again.');
            console.log('[Reschedule] No valid appointment ID found. Full appointment object:', JSON.stringify(appointment, null, 2));
            return;
        }

        console.log('[Reschedule] Using appointment ID:', idToUse);

        Alert.alert(
            'Confirm Reschedule',
            `Reschedule your appointment to ${formattedDate} at ${selectedTime}?`,

            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            const result = await rescheduleAppointment(idToUse, {
                                date: formattedDate,
                                time: selectedTime,
                            });

                            if (result.success) {
                                Alert.alert(
                                    'Appointment Rescheduled',
                                    `Your appointment has been rescheduled to ${formattedDate} at ${selectedTime}`,

                                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                                );
                            } else {
                                Alert.alert('Error', result.error || 'Failed to reschedule appointment');
                            }
                        } catch (error) {
                            console.log('[Reschedule] Error:', error);
                            Alert.alert('Error', 'Something went wrong. Please try again.');
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
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
                    <Text style={styles.headerTitle}>Reschedule Appointment</Text>
                    <View style={{ width: scale(40) }} />
                </View>

                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {/* Current Appointment Info */}
                    <View style={styles.currentInfo}>
                        <Text style={styles.currentLabel}>Current Appointment</Text>
                        <View style={styles.currentCard}>
                            <Ionicons name="calendar-outline" size={moderateScale(20)} color="#6B7280" />
                            <Text style={styles.currentText}>{appointment?.date} at {appointment?.time}</Text>
                        </View>
                    </View>

                    {/* Select New Date - Integrated Calendar */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Select New Date</Text>
                        <View style={styles.calendarContainer}>
                            <Calendar
                                current={today}
                                minDate={today}
                                onDayPress={(day) => {
                                    setSelectedDate(day.dateString);
                                }}
                                markedDates={{
                                    [selectedDate]: { selected: true, selectedColor: '#23238E' }
                                }}
                                theme={{
                                    selectedDayBackgroundColor: '#23238E',
                                    todayTextColor: '#23238E',
                                    arrowColor: '#23238E',
                                    monthTextColor: '#23238E',
                                    textDayFontSize: 14,
                                    textMonthFontSize: 16,
                                    textDayHeaderFontSize: 12
                                }}
                                style={styles.calendar}
                            />
                        </View>
                    </View>

                    {/* Select Time Slot */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Select Time Slot</Text>
                        <View style={styles.timeSlotsGrid}>
                            {timeSlots.map((time) => (
                                <TouchableOpacity
                                    key={time}
                                    style={[
                                        styles.timeSlot,
                                        selectedTime === time && styles.timeSlotActive,
                                    ]}
                                    onPress={() => setSelectedTime(time)}
                                >
                                    <Text style={[
                                        styles.timeSlotText,
                                        selectedTime === time && styles.timeSlotTextActive,
                                    ]}>
                                        {time}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Selection Summary */}
                    {selectedDate && selectedTime && (
                        <View style={styles.summaryCard}>
                            <Ionicons name="checkmark-circle" size={moderateScale(24)} color="#10B981" />
                            <View style={styles.summaryInfo}>
                                <Text style={styles.summaryTitle}>New Appointment Time</Text>
                                <Text style={styles.summaryText}>
                                    {new Date(selectedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} at {selectedTime}
                                </Text>
                            </View>
                        </View>
                    )}

                </ScrollView>

                {/* Bottom Button */}
                <View style={styles.bottomContainer}>
                    <TouchableOpacity
                        style={[styles.rescheduleBtn, (!selectedDate || !selectedTime || loading) && styles.btnDisabled]}
                        onPress={handleReschedule}
                        disabled={!selectedDate || !selectedTime || loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="calendar-outline" size={moderateScale(20)} color="#fff" />
                                <Text style={styles.rescheduleBtnText}>Confirm Reschedule</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    safeArea: { flex: 1 },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: wp(4),
        paddingVertical: hp(1.5),
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backBtn: { width: scale(40), padding: scale(4) },
    headerTitle: { fontSize: moderateScale(18), fontWeight: '600', color: '#222' },

    scrollView: { flex: 1 },

    currentInfo: { padding: wp(4) },
    currentLabel: { fontSize: moderateScale(14), color: '#6B7280', marginBottom: verticalScale(8) },
    currentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        padding: scale(14),
        borderRadius: scale(10),
        gap: scale(10),
    },
    currentText: { fontSize: moderateScale(15), color: '#92400E', fontWeight: '500' },

    section: { paddingHorizontal: wp(4), marginBottom: verticalScale(24) },
    sectionTitle: { fontSize: moderateScale(16), fontWeight: '700', color: '#374151', marginBottom: verticalScale(12) },

    calendarContainer: {
        backgroundColor: '#fff',
        borderRadius: scale(16),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        overflow: 'hidden',
        padding: scale(10),
    },
    calendar: {
        borderRadius: scale(12),
    },


    timeSlotsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: scale(10),
    },
    timeSlot: {
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(12),
        backgroundColor: '#fff',
        borderRadius: scale(8),
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    timeSlotActive: {
        backgroundColor: '#23238E',
        borderColor: '#23238E',
    },
    timeSlotText: { fontSize: moderateScale(13), color: '#374151', fontWeight: '500' },
    timeSlotTextActive: { color: '#fff' },

    summaryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECFDF5',
        marginHorizontal: wp(4),
        padding: scale(16),
        borderRadius: scale(12),
        gap: scale(12),
        marginBottom: verticalScale(24),
    },
    summaryInfo: { flex: 1 },
    summaryTitle: { fontSize: moderateScale(14), fontWeight: '600', color: '#065F46' },
    summaryText: { fontSize: moderateScale(13), color: '#10B981', marginTop: verticalScale(2) },

    bottomContainer: {
        backgroundColor: '#fff',
        padding: wp(4),
        paddingBottom: hp(3),
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    rescheduleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#23238E',
        paddingVertical: verticalScale(16),
        borderRadius: scale(12),
        gap: scale(10),
    },
    btnDisabled: { opacity: 0.5 },
    rescheduleBtnText: { color: '#fff', fontSize: moderateScale(16), fontWeight: '600' },
});
