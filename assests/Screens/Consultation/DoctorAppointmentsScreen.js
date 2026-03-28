import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    StatusBar,
    RefreshControl,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import { getAllAppointments, onAllAppointmentsChange, updateData, isFutureAppointment } from '../../Utils/firebaseDatabase';

export default function DoctorAppointmentsScreen({ navigation }) {
    const [selectedTab, setSelectedTab] = useState('upcoming');
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch all appointments (admin/doctor view)
    useFocusEffect(
        useCallback(() => {
            fetchAppointments();
        }, [])
    );

    useEffect(() => {
        // Subscribe to real-time updates for all appointments
        const unsubscribe = onAllAppointmentsChange((apptList) => {
            setAppointments(apptList);
            setLoading(false);
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    const fetchAppointments = async () => {
        try {
            const result = await getAllAppointments();
            if (result.success && result.data) {
                setAppointments(result.data);
            }
        } catch (error) {
            console.log('Error fetching appointments:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchAppointments();
    };

    const filteredAppointments = appointments.filter((appt) => {
        if (selectedTab === 'upcoming') {
            return appt.status === 'upcoming' && isFutureAppointment(appt);
        }
        if (selectedTab === 'completed') return appt.status === 'completed';
        if (selectedTab === 'cancelled') return appt.status === 'cancelled';

        // If it was 'upcoming' but is now in the past, it belongs to history (completed/archived)
        // For the doctor's view, we might want a 'past' tab or include them in completed
        return true;
    });

    const handleUpdateStatus = (appt, newStatus) => {
        const statusLabels = { completed: 'Complete', cancelled: 'Cancel' };
        Alert.alert(
            `${statusLabels[newStatus]} Appointment`,
            `Are you sure you want to mark this appointment as ${newStatus}?`,
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes',
                    onPress: async () => {
                        try {
                            // Update in user's appointments (single source of truth)
                            if (appt.userId && appt.id) {
                                await updateData(`appointments/${appt.userId}/${appt.id}`, {
                                    status: newStatus,
                                    updatedAt: new Date().toISOString(),
                                });
                            }

                            Alert.alert('Success', `Appointment marked as ${newStatus}`);
                        } catch (error) {
                            Alert.alert('Error', 'Failed to update appointment');
                        }
                    },
                },
            ]
        );
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'upcoming': return { bg: '#DBEAFE', text: '#2563EB' };
            case 'completed': return { bg: '#D1FAE5', text: '#059669' };
            case 'cancelled': return { bg: '#FEE2E2', text: '#DC2626' };
            default: return { bg: '#F3F4F6', text: '#6B7280' };
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    };

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
            <StatusBar barStyle="light-content" backgroundColor="#23238E" />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={moderateScale(24)} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Manage Appointments</Text>
                    <TouchableOpacity style={styles.headerIconBtn}>
                        <Ionicons name="search-outline" size={moderateScale(22)} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                    <View style={[styles.statCard, { backgroundColor: '#3B82F6' }]}>
                        <Text style={styles.statNumber}>{appointments.filter(a => a.status === 'upcoming').length}</Text>
                        <Text style={styles.statLabel}>Upcoming</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: '#10B981' }]}>
                        <Text style={styles.statNumber}>{appointments.filter(a => a.status === 'completed').length}</Text>
                        <Text style={styles.statLabel}>Completed</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: '#EF4444' }]}>
                        <Text style={styles.statNumber}>{appointments.filter(a => a.status === 'cancelled').length}</Text>
                        <Text style={styles.statLabel}>Cancelled</Text>
                    </View>
                </View>

                {/* Tabs */}
                <View style={styles.tabsContainer}>
                    {['upcoming', 'completed', 'cancelled'].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tab, selectedTab === tab && styles.tabActive]}
                            onPress={() => setSelectedTab(tab)}
                        >
                            <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Appointments List */}
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#23238E']} />
                    }
                >
                    {filteredAppointments.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="calendar-outline" size={moderateScale(60)} color="#D1D5DB" />
                            <Text style={styles.emptyTitle}>No {selectedTab} appointments</Text>
                        </View>
                    ) : (
                        filteredAppointments.map((appt) => {
                            const statusStyle = getStatusStyle(appt.status);
                            return (
                                <View key={appt.id} style={styles.appointmentCard}>
                                    <View style={styles.cardHeader}>
                                        <View style={styles.patientInfo}>
                                            <View style={styles.patientAvatar}>
                                                <Text style={styles.avatarText}>
                                                    {appt.patientName?.charAt(0) || 'P'}
                                                </Text>
                                            </View>
                                            <View style={styles.patientDetails}>
                                                <Text style={styles.patientName}>{appt.patientName || 'Patient'}</Text>
                                                <Text style={styles.patientEmail}>{appt.userEmail}</Text>
                                            </View>
                                        </View>
                                        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                                            <Text style={[styles.statusText, { color: statusStyle.text }]}>{appt.status}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.cardBody}>
                                        <View style={styles.infoRow}>
                                            <View style={styles.infoItem}>
                                                <Ionicons name="person-outline" size={moderateScale(16)} color="#6B7280" />
                                                <Text style={styles.infoText}>{appt.doctor?.name || 'Doctor'}</Text>
                                            </View>
                                            <View style={styles.infoItem}>
                                                <Ionicons name="calendar-outline" size={moderateScale(16)} color="#6B7280" />
                                                <Text style={styles.infoText}>{appt.date}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.infoRow}>
                                            <View style={styles.infoItem}>
                                                <Ionicons name={appt.type === 'online' ? 'videocam-outline' : 'business-outline'} size={moderateScale(16)} color="#6B7280" />
                                                <Text style={styles.infoText}>{appt.type === 'online' ? 'Online' : 'Clinic'}</Text>
                                            </View>
                                            <View style={styles.infoItem}>
                                                <Ionicons name="time-outline" size={moderateScale(16)} color="#6B7280" />
                                                <Text style={styles.infoText}>{appt.time}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.infoRow}>
                                            <View style={styles.infoItem}>
                                                <Ionicons name="cash-outline" size={moderateScale(16)} color="#6B7280" />
                                                <Text style={styles.infoText}>₹{appt.totalAmount || appt.fee || 0}</Text>
                                            </View>
                                            <View style={styles.infoItem}>
                                                <Ionicons name="time-outline" size={moderateScale(16)} color="#9CA3AF" />
                                                <Text style={[styles.infoText, { color: '#9CA3AF' }]}>{formatDate(appt.createdAt)}</Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Action Buttons for Upcoming */}
                                    {appt.status === 'upcoming' && (
                                        <View style={styles.cardActions}>
                                            <TouchableOpacity
                                                style={styles.completeBtn}
                                                onPress={() => handleUpdateStatus(appt, 'completed')}
                                            >
                                                <Ionicons name="checkmark-circle-outline" size={moderateScale(18)} color="#10B981" />
                                                <Text style={styles.completeBtnText}>Complete</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.cancelBtn}
                                                onPress={() => handleUpdateStatus(appt, 'cancelled')}
                                            >
                                                <Ionicons name="close-circle-outline" size={moderateScale(18)} color="#EF4444" />
                                                <Text style={styles.cancelBtnText}>Cancel</Text>
                                            </TouchableOpacity>
                                            {appt.type === 'online' && (
                                                <TouchableOpacity
                                                    style={styles.callBtn}
                                                    onPress={() => navigation.navigate('DocVideoCallScreen', { doctor: appt.doctor, patient: appt.patientName })}
                                                >
                                                    <Ionicons name="videocam" size={moderateScale(18)} color="#fff" />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    )}
                                </View>
                            );
                        })
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    safeArea: { flex: 1 },
    centered: { justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: verticalScale(16), fontSize: moderateScale(14), color: '#666' },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: wp(4),
        paddingVertical: hp(1.5),
        backgroundColor: '#23238E',
    },
    backBtn: { width: scale(40), padding: scale(4) },
    headerTitle: { fontSize: moderateScale(18), fontWeight: '600', color: '#fff' },
    headerIconBtn: { width: scale(40), alignItems: 'flex-end', padding: scale(4) },

    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: wp(4),
        paddingVertical: hp(2),
        gap: scale(10),
        backgroundColor: '#23238E',
    },
    statCard: {
        flex: 1,
        paddingVertical: verticalScale(14),
        borderRadius: scale(12),
        alignItems: 'center',
    },
    statNumber: { fontSize: moderateScale(24), fontWeight: '700', color: '#fff' },
    statLabel: { fontSize: moderateScale(12), color: 'rgba(255,255,255,0.8)', marginTop: verticalScale(4) },

    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: wp(4),
        paddingVertical: hp(1.5),
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        gap: scale(8),
    },
    tab: {
        flex: 1,
        paddingVertical: verticalScale(10),
        alignItems: 'center',
        borderRadius: scale(8),
        backgroundColor: '#F3F4F6',
    },
    tabActive: { backgroundColor: '#EEF2FF' },
    tabText: { fontSize: moderateScale(13), color: '#6B7280', fontWeight: '500' },
    tabTextActive: { color: '#23238E', fontWeight: '600' },

    scrollView: { flex: 1 },
    scrollContent: { padding: wp(4), paddingBottom: hp(4) },

    emptyState: { alignItems: 'center', paddingVertical: hp(10) },
    emptyTitle: { fontSize: moderateScale(16), color: '#9CA3AF', marginTop: verticalScale(16) },

    appointmentCard: {
        backgroundColor: '#fff',
        borderRadius: scale(14),
        marginBottom: verticalScale(12),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: scale(14),
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        backgroundColor: '#FAFAFA',
    },
    patientInfo: { flexDirection: 'row', alignItems: 'center' },
    patientAvatar: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(20),
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: scale(10),
    },
    avatarText: { fontSize: moderateScale(16), fontWeight: '700', color: '#23238E' },
    patientDetails: {},
    patientName: { fontSize: moderateScale(15), fontWeight: '600', color: '#374151' },
    patientEmail: { fontSize: moderateScale(11), color: '#9CA3AF', marginTop: verticalScale(2) },
    statusBadge: { paddingHorizontal: scale(10), paddingVertical: verticalScale(4), borderRadius: scale(6) },
    statusText: { fontSize: moderateScale(11), fontWeight: '600', textTransform: 'capitalize' },

    cardBody: { padding: scale(14) },
    infoRow: { flexDirection: 'row', marginBottom: verticalScale(8) },
    infoItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: scale(6) },
    infoText: { fontSize: moderateScale(13), color: '#374151' },

    cardActions: {
        flexDirection: 'row',
        padding: scale(12),
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        gap: scale(10),
    },
    completeBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: verticalScale(10),
        borderRadius: scale(8),
        backgroundColor: '#D1FAE5',
        gap: scale(6),
    },
    completeBtnText: { color: '#10B981', fontSize: moderateScale(13), fontWeight: '600' },
    cancelBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: verticalScale(10),
        borderRadius: scale(8),
        backgroundColor: '#FEE2E2',
        gap: scale(6),
    },
    cancelBtnText: { color: '#EF4444', fontSize: moderateScale(13), fontWeight: '600' },
    callBtn: {
        width: scale(44),
        height: scale(44),
        borderRadius: scale(22),
        backgroundColor: '#23238E',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
