import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, StatusBar, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Calendar } from 'react-native-calendars';
import { scale, verticalScale, moderateScale, wp, hp, screenWidth } from '../../Utils/responsive';
import { getLabCartItems, getLabCartTotal } from '../../Utils/firebaseLabStorage';



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

const getTimeSlots = (selectedDateStr) => {
    const slots = [
        { id: 1, time: '06:00 AM - 08:00 AM', available: true, hour: 6 },
        { id: 2, time: '08:00 AM - 10:00 AM', available: true, hour: 8 },
        { id: 3, time: '10:00 AM - 12:00 PM', available: true, hour: 10 },
        { id: 4, time: '12:00 PM - 02:00 PM', available: true, hour: 12 },
        { id: 5, time: '02:00 PM - 04:00 PM', available: true, hour: 14 },
        { id: 6, time: '04:00 PM - 06:00 PM', available: true, hour: 16 },
        { id: 7, time: '06:00 PM - 08:00 PM', available: true, hour: 18 },
    ];
    const todayStr = new Date().toISOString().split('T')[0];
    if (selectedDateStr === todayStr) {
        const currentHour = new Date().getHours();
        return slots.map(slot => ({ ...slot, available: slot.hour > currentHour }));
    }
    return slots;
};

export default function ScheduleLabScreen({ navigation, route }) {
    const today = new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState(today);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [totals, setTotals] = useState({ subtotal: 0, taxes: 0, total: 0 });
    const [selectedAddress, setSelectedAddress] = useState(null);

    const activeSlots = getTimeSlots(selectedDate);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [selectedDate])
    );

    const loadData = async () => {
        const items = await getLabCartItems();
        const cartTotals = await getLabCartTotal();
        setCartItems(items);
        setTotals(cartTotals);

        const { getAddresses } = require('../../Utils/firebaseDatabase');
        const addrResult = await getAddresses();
        if (addrResult.success && addrResult.data.length > 0) {
            const def = addrResult.data.find(a => a.isDefault) || addrResult.data[0];
            setSelectedAddress(def);
        }
    };

    const handleProceed = () => {
        if (!selectedSlot) {
            Alert.alert('Time Slot Required', 'Please select a preferred time slot to continue.');
            return;
        }

        const selectedSlotObj = activeSlots.find(s => s.id === selectedSlot);
        const dateObj = new Date(selectedDate);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const formattedDate = `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;

        const COLLECTION_CHARGE = 50;
        const subtotal = totals.subtotal;
        const tax = totals.taxes;
        const grandTotal = subtotal + tax + COLLECTION_CHARGE;

        const bookingDetails = {
            type: 'lab',
            items: cartItems.map(item => ({
                id: String(item.id),
                name: String(item.name || 'Unknown Test'),
                price: parseFloat(item.price) || 0,
                lab: item.lab || 'Apollo Labs',
            })),
            provider: { name: 'Apollo Labs', address: 'T.nagar, Chennai', logo: 'apollo.png' },
            schedule: {
                date: formattedDate,
                timeSlot: selectedSlotObj?.time || '08:00 AM - 10:00 AM',
            },
            summary: { subtotal, collectionCharge: COLLECTION_CHARGE, tax, total: grandTotal },
            location: selectedAddress ? {
                address: `${selectedAddress.houseNo}, ${selectedAddress.street}, ${selectedAddress.city}`,
                type: selectedAddress.type,
            } : null,
        };

        navigation.navigate('SelectPatientScreen', {
            appointmentData: bookingDetails,
            isLabFlow: true
        });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={moderateScale(24)} color={COLORS.text} />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>Lab appointment</Text>
                        <Text style={styles.stepIndicator}>Step 1 of 3</Text>
                    </View>
                    <View style={{ width: scale(40) }} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Select Patient Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Select Patient</Text>
                        <TouchableOpacity
                            style={styles.patientCard}
                            onPress={() => navigation.navigate('SelectPatientScreen', { isLabFlow: true })}
                        >
                            <View style={styles.patientIconBox}>
                                <Ionicons name="person-outline" size={moderateScale(20)} color={COLORS.primary} />
                            </View>
                            <Text style={styles.patientName}>Select Patient</Text>
                            <Ionicons name="chevron-forward" size={moderateScale(18)} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Date Picker */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Select Date</Text>
                        <View style={styles.calendarWrapper}>
                            <Calendar
                                current={today}
                                minDate={today}
                                onDayPress={(day) => {
                                    setSelectedDate(day.dateString);
                                    setSelectedSlot(null);
                                }}
                                markedDates={{
                                    [selectedDate]: { selected: true, selectedColor: COLORS.primary }
                                }}
                                theme={{
                                    selectedDayBackgroundColor: COLORS.primary,
                                    todayTextColor: COLORS.primary,
                                    arrowColor: COLORS.primary,
                                    textMonthFontWeight: '800',
                                    textDayHeaderFontWeight: '600',
                                }}
                                style={styles.calendar}
                            />
                        </View>
                    </View>

                    {/* Slot Picker */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Pick a Time Slot</Text>
                        <View style={styles.slotGrid}>
                            {activeSlots.map((slot) => (
                                <TouchableOpacity
                                    key={slot.id}
                                    style={[
                                        styles.slotCard,
                                        selectedSlot === slot.id && styles.slotCardActive,
                                        !slot.available && styles.slotDisabled
                                    ]}
                                    onPress={() => slot.available && setSelectedSlot(slot.id)}
                                >
                                    <Text style={[
                                        styles.slotText,
                                        selectedSlot === slot.id && styles.slotTextActive,
                                        !slot.available && styles.slotTextDisabled
                                    ]}>
                                        {slot.time}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={{ height: hp(12) }} />
                </ScrollView>

                {/* Bottom Bar */}
                <View style={styles.bottomBar}>
                    <View style={styles.totalBlock}>
                        <Text style={styles.totalLabel}>Total Price</Text>
                        <Text style={styles.totalVal}>₹{totals.subtotal + totals.taxes + 50}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.confirmBtn}
                        onPress={handleProceed}
                    >
                        <Text style={styles.confirmBtnText}>Confirm Appointment</Text>
                    </TouchableOpacity>
                </View>
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
        paddingVertical: hp(1.5),
    },
    backBtn: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(20),
        backgroundColor: '#F5F7FA',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitleContainer: {
        flex: 1,
        marginLeft: scale(15),
    },
    headerTitle: { fontSize: moderateScale(18), fontWeight: '800', color: COLORS.text },
    stepIndicator: { fontSize: moderateScale(11), color: COLORS.textSecondary, fontWeight: '600' },
    scrollContent: { paddingTop: hp(2) },
    section: { paddingHorizontal: wp(5), marginBottom: hp(3) },
    sectionTitle: { fontSize: moderateScale(16), fontWeight: '800', color: COLORS.text, marginBottom: hp(1.5) },
    patientCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F7FA',
        padding: scale(12),
        borderRadius: scale(14),
        gap: scale(12),
    },
    patientIconBox: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(20),
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    patientName: { flex: 1, fontSize: moderateScale(14), fontWeight: '700', color: COLORS.text },
    calendarWrapper: {
        backgroundColor: COLORS.white,
        borderRadius: scale(20),
        borderWidth: 1,
        borderColor: '#E8EBF0',
        padding: scale(10),
        overflow: 'hidden',
    },
    calendar: { borderRadius: scale(16) },
    slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: scale(10) },
    slotCard: {
        width: (screenWidth - wp(10) - scale(10)) / 2,
        backgroundColor: '#F5F7FA',
        paddingVertical: hp(1.5),
        borderRadius: scale(12),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    slotCardActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    slotDisabled: { opacity: 0.5 },
    slotText: { fontSize: moderateScale(13), fontWeight: '700', color: COLORS.textSecondary },
    slotTextActive: { color: COLORS.white },
    slotTextDisabled: { color: '#CCC' },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        padding: wp(5),
        backgroundColor: COLORS.white,
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(15),
        borderTopWidth: 1,
        borderTopColor: '#F5F7FA',
    },
    totalBlock: { flex: 0.8 },
    totalLabel: { fontSize: moderateScale(12), color: COLORS.textSecondary, fontWeight: '600' },
    totalVal: { fontSize: moderateScale(22), fontWeight: '900', color: COLORS.text },
    confirmBtn: {
        flex: 1.2,
        height: hp(6.5),
        backgroundColor: COLORS.primary,
        borderRadius: scale(12),
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmBtnText: { color: COLORS.white, fontSize: moderateScale(14), fontWeight: '800' },
});
