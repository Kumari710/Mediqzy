import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
    TextInput,
    ActivityIndicator,
    StatusBar,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import database from '@react-native-firebase/database';
import { getCurrentUser } from '../../Utils/firebaseAuth';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

const { width } = Dimensions.get('window');

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
    pending: '#F59E0B',
};

export default function MyReportsScreen({ navigation }) {
    const [activeTab, setActiveTab] = useState('Laboratory');
    const [labFilter, setLabFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [labOrders, setLabOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const user = getCurrentUser();

    useEffect(() => {
        if (!user) return;

        const labRef = database().ref(`labOrders/${user.uid}`);
        const labListener = labRef.on('value', (snapshot) => {
            const data = snapshot.val();
            const list = data ? Object.entries(data).map(([key, value]) => ({
                id: key,
                ...value
            })) : [];
            setLabOrders(list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
            setLoading(false);
        });

        return () => labRef.off('value', labListener);
    }, []);

    const filteredLabs = labOrders.filter(order => {
        const matchesSearch = order.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.patientName?.toLowerCase().includes(searchQuery.toLowerCase());
        const status = order.status?.toLowerCase() || 'pending';
        if (labFilter === 'All') return matchesSearch;
        if (labFilter === 'Pending') return matchesSearch && (status === 'pending' || status === 'in_progress' || status === 'processing');
        if (labFilter === 'Completed') return matchesSearch && (status === 'completed' || status === 'delivered');
        return matchesSearch;
    });

    const renderLabItem = ({ item }) => {
        const status = (item.status || 'pending').toLowerCase();
        const isCompleted = status === 'completed' || status === 'delivered';

        return (
            <View style={styles.cardContainer}>
                <View style={styles.cardContent}>
                    {/* Left: Lab Logo */}
                    <View style={styles.logoSection}>
                        <View style={styles.hospitalAvatarBox}>
                            <Image
                                source={require('../../images/apollo.png')}
                                style={styles.hospitalLogoSmall}
                            />
                        </View>
                        <View style={styles.ratingRow}>
                            <Ionicons name="star" size={moderateScale(10)} color="#FFD700" />
                            <Text style={styles.ratingText}>4.8</Text>
                        </View>
                    </View>

                    {/* Center: Details */}
                    <View style={styles.detailsSection}>
                        <Text style={styles.labNameText}>{item.labName || item.provider?.name || 'Apollo Diagnostics'}</Text>
                        <Text style={styles.orderIdText}>Order ID: {item.orderId || 'LAB975547'}</Text>

                        <View style={styles.patientMeta}>
                            <Text style={styles.patientInfoText}>{item.patientName || item.patient?.name || 'Shivakumar'} - Self</Text>
                            <Text style={styles.patientInfoText}>{item.patientAge || item.patient?.age || '25'} Years</Text>
                        </View>

                        <View style={styles.dateTimeRow}>
                            <View style={styles.iconInfo}>
                                <Ionicons name="calendar-outline" size={moderateScale(13)} color={COLORS.primary} />
                                <Text style={styles.dateText}>{item.schedule?.date || item.testDate || '01 Jan 2024'}</Text>
                            </View>
                            <View style={[styles.iconInfo, { marginLeft: scale(10) }]}>
                                <Ionicons name="time-outline" size={moderateScale(13)} color={COLORS.primary} />
                                <Text style={styles.dateText}>{item.schedule?.timeSlot?.split(' - ')[0] || item.timeSlot?.split(' - ')[0] || '08:00 AM'}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Right: Status Badges */}
                    <View style={styles.statusBadgeContainer}>
                        <View style={styles.labBadge}>
                            <Ionicons name="flask" size={moderateScale(10)} color={COLORS.primary} />
                            <Text style={styles.labBadgeText}>Laboratory</Text>
                        </View>
                        <View style={[styles.statusBadge, {
                            backgroundColor: isCompleted ? '#ECFDF5' : '#FFFBEB'
                        }]}>
                            <Text style={[styles.statusBadgeText, {
                                color: isCompleted ? COLORS.success : COLORS.pending
                            }]}>
                                {item.status || 'Pending'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Footer Buttons */}
                <View style={styles.cardFooter}>
                    <TouchableOpacity
                        style={styles.viewDetailsBtn}
                        onPress={() => navigation.navigate(isCompleted ? 'CompletedLabReportScreen' : 'LabTestDetailsScreen', { order: item })}
                    >
                        <Text style={styles.viewDetailsText}>View Details</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.primaryActionBtn}
                        onPress={() => navigation.navigate(isCompleted ? 'ViewLabReportScreen' : 'LabTestDetailsScreen', { order: item })}
                    >
                        <Text style={styles.primaryActionText}>
                            {isCompleted ? 'Download Report' : 'Track Order'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
                <Ionicons
                    name={activeTab === 'Prescription' ? 'document-attach-outline' : 'flask-outline'}
                    size={scale(60)}
                    color="#23238E"
                />
            </View>
            <Text style={styles.emptyTitle}>
                {activeTab === 'Prescription' ? 'No Prescription added' : 'No Lab Reports added'}
            </Text>
            <Text style={styles.emptySubtitle}>
                Please wait for some time, you will receive your {activeTab === 'Prescription' ? 'prescription' : 'report'}
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header Switcher */}
                <View style={styles.headerSwitcher}>
                    <TouchableOpacity
                        style={[styles.switchBtn, activeTab === 'Prescription' && styles.activeSwitchBtn]}
                        onPress={() => setActiveTab('Prescription')}
                    >
                        <Text style={[styles.switchText, activeTab === 'Prescription' && styles.activeSwitchText]}>Prescription</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.switchBtn, activeTab === 'Laboratory' && styles.activeSwitchBtn]}
                        onPress={() => setActiveTab('Laboratory')}
                    >
                        <Text style={[styles.switchText, activeTab === 'Laboratory' && styles.activeSwitchText]}>Laboratory</Text>
                    </TouchableOpacity>
                </View>

                {activeTab === 'Laboratory' && (
                    <View style={styles.labHeaderContent}>
                        <View style={styles.titleRow}>
                            <Text style={styles.mainTitle}>Lab appointments</Text>
                            <TouchableOpacity>
                                <Ionicons name="search-outline" size={scale(22)} color={COLORS.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.searchBarContainer}>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search Lab Appointment"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholderTextColor={COLORS.textSecondary}
                            />
                            <Ionicons name="search" size={scale(18)} color={COLORS.primary} />
                        </View>

                        <View style={styles.filterRow}>
                            {['All', 'Pending', 'Completed'].map(filter => (
                                <TouchableOpacity
                                    key={filter}
                                    style={[styles.filterChip, labFilter === filter && styles.activeFilterChip]}
                                    onPress={() => setLabFilter(filter)}
                                >
                                    <Text style={[styles.filterChipText, labFilter === filter && styles.activeFilterChipText]}>
                                        {filter}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {loading ? (
                    <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: hp(10) }} />
                ) : (
                    <FlatList
                        data={activeTab === 'Laboratory' ? filteredLabs : []}
                        renderItem={activeTab === 'Laboratory' ? renderLabItem : null}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContainer}
                        ListEmptyComponent={renderEmptyState}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    safeArea: { flex: 1 },
    headerSwitcher: {
        flexDirection: 'row',
        backgroundColor: '#E5E7EB',
        marginHorizontal: wp(5),
        marginTop: hp(2),
        borderRadius: scale(12),
        padding: scale(4),
    },
    switchBtn: { flex: 1, paddingVertical: hp(1.2), alignItems: 'center', borderRadius: scale(8) },
    activeSwitchBtn: { backgroundColor: COLORS.primary },
    switchText: { fontSize: moderateScale(14), fontWeight: '700', color: COLORS.textSecondary },
    activeSwitchText: { color: COLORS.white },

    labHeaderContent: { paddingHorizontal: wp(5), marginTop: hp(2) },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: hp(2) },
    mainTitle: { fontSize: moderateScale(20), fontWeight: '900', color: COLORS.text },

    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: scale(12),
        paddingHorizontal: scale(15),
        height: hp(6),
        marginBottom: hp(2),
    },
    searchInput: { flex: 1, fontSize: moderateScale(14), color: COLORS.text, fontWeight: '600' },

    filterRow: { flexDirection: 'row', gap: scale(8), marginBottom: hp(1) },
    filterChip: {
        paddingHorizontal: scale(18),
        paddingVertical: hp(0.8),
        borderRadius: scale(20),
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: 'transparent'
    },
    activeFilterChip: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    filterChipText: { fontSize: moderateScale(13), fontWeight: '700', color: COLORS.textSecondary },
    activeFilterChipText: { color: COLORS.white },

    listContainer: { paddingHorizontal: wp(5), paddingBottom: hp(15), paddingTop: hp(1) },
    cardContainer: {
        backgroundColor: COLORS.white,
        borderRadius: scale(20),
        marginBottom: hp(2),
        borderWidth: 1,
        borderColor: '#EFEFEF',
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        overflow: 'hidden'
    },
    cardContent: { flexDirection: 'row', padding: scale(15), gap: scale(12) },
    logoSection: { alignItems: 'center', gap: hp(0.5) },
    hospitalAvatarBox: { padding: scale(5), backgroundColor: '#F8FAFC', borderRadius: scale(10) },
    hospitalLogoSmall: { width: scale(55), height: scale(55), borderRadius: scale(8) },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: scale(2) },
    ratingText: { fontSize: moderateScale(11), fontWeight: '800', color: COLORS.text },

    detailsSection: { flex: 1 },
    labNameText: { fontSize: moderateScale(15), fontWeight: '900', color: COLORS.text },
    orderIdText: { fontSize: moderateScale(11), color: COLORS.textSecondary, marginBottom: hp(0.5) },
    patientMeta: { marginBottom: hp(0.5) },
    patientInfoText: { fontSize: moderateScale(12), color: COLORS.textSecondary, fontWeight: '600' },

    dateTimeRow: { flexDirection: 'row', alignItems: 'center', marginTop: hp(0.5) },
    iconInfo: { flexDirection: 'row', alignItems: 'center', gap: scale(4) },
    dateText: { fontSize: moderateScale(12), color: COLORS.primary, fontWeight: '800' },

    statusBadgeContainer: { alignItems: 'flex-end', gap: hp(1) },
    labBadge: { flexDirection: 'row', alignItems: 'center', gap: scale(3), backgroundColor: '#EEF2FF', paddingHorizontal: scale(8), paddingVertical: hp(0.4), borderRadius: scale(6) },
    labBadgeText: { fontSize: moderateScale(9), fontWeight: '800', color: COLORS.primary },
    statusBadge: { paddingHorizontal: scale(10), paddingVertical: hp(0.5), borderRadius: scale(8) },
    statusBadgeText: { fontSize: moderateScale(10), fontWeight: '900' },

    cardFooter: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F5F7FA', padding: scale(12), gap: scale(10) },
    viewDetailsBtn: { flex: 1, paddingVertical: hp(1.2), alignItems: 'center', borderRadius: scale(10), borderWidth: 1, borderColor: COLORS.primary },
    viewDetailsText: { fontSize: moderateScale(13), fontWeight: '800', color: COLORS.primary },
    primaryActionBtn: { flex: 2, paddingVertical: hp(1.2), alignItems: 'center', borderRadius: scale(10), backgroundColor: COLORS.primary },
    primaryActionText: { fontSize: moderateScale(13), fontWeight: '800', color: COLORS.white },

    emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: hp(15) },
    emptyIconCircle: { width: scale(100), height: scale(100), borderRadius: scale(50), backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginBottom: hp(2) },
    emptyTitle: { fontSize: moderateScale(18), fontWeight: '900', color: COLORS.text, marginBottom: hp(1) },
    emptySubtitle: { fontSize: moderateScale(13), color: COLORS.textSecondary, textAlign: 'center', paddingHorizontal: wp(10) },
});

