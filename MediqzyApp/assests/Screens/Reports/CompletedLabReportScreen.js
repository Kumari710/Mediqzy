import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    ActivityIndicator,
    StatusBar,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

const COLORS = {
    primary: '#23238E',
    success: '#10B981',
    white: '#FFFFFF',
    background: '#F8FAFC',
    text: '#1A1A2E',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    warningBg: '#FFFBEB',
    warningText: '#92400E',
};

export default function CompletedLabReportScreen({ navigation, route }) {
    const { order } = route.params || {};

    const handleDownload = () => {
        navigation.navigate('ViewLabReportScreen', { order });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Hero Header */}
                <View style={styles.heroContainer}>
                    <Image
                        source={require('../../images/labtest.png')}
                        style={styles.heroImage}
                    />
                    <SafeAreaView style={styles.headerButtons} edges={['top']}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconCircle}>
                            <Ionicons name="arrow-back" size={scale(20)} color={COLORS.text} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconCircle}>
                            <Ionicons name="share-social-outline" size={scale(20)} color={COLORS.text} />
                        </TouchableOpacity>
                    </SafeAreaView>
                </View>

                <View style={styles.body}>
                    {/* Map Integration */}
                    <View style={styles.mapBox}>
                        <Image
                            source={require('../../images/Map.png')}
                            style={styles.mapImage}
                        />
                        <View style={styles.mapOverlay}>
                            <Ionicons name="location" size={scale(30)} color="#FF4444" />
                        </View>
                    </View>

                    {/* Lab Info */}
                    <View style={styles.labInfoSection}>
                        <View style={styles.labBadgeRow}>
                            <Text style={styles.labCategory}>Radiology & Pathology</Text>
                            <View style={styles.ratingBox}>
                                <Ionicons name="star" size={scale(12)} color="#FFB800" />
                                <Text style={styles.ratingText}>4.8</Text>
                            </View>
                        </View>
                        <Text style={styles.labNameText}>{order?.labName || 'Apollo Diagnostics Centre'}</Text>
                        <TouchableOpacity>
                            <Text style={styles.linkText}>See All Reviews</Text>
                        </TouchableOpacity>

                        <View style={styles.addressRow}>
                            <View style={styles.addressInfo}>
                                <View style={styles.primaryIconBox}>
                                    <Ionicons name="location" size={scale(18)} color={COLORS.primary} />
                                </View>
                                <Text style={styles.addressPara} numberOfLines={2}>
                                    {order?.location?.address || 'No. 12, Anna Nagar West, near Metro, Chennai, Tamil Nadu 600040'}
                                </Text>
                            </View>
                            <View style={styles.directionActions}>
                                <TouchableOpacity style={styles.actionIcon}>
                                    <Ionicons name="call" size={scale(18)} color={COLORS.primary} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionIcon}>
                                    <Ionicons name="map" size={scale(18)} color={COLORS.primary} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Appointment Details */}
                    <Text style={styles.sectionHeading}>Appointment Details</Text>
                    <View style={styles.detailsCard}>
                        <DetailRow label="Patient Name" value={order?.patientName || 'Shivakumar'} />
                        <DetailRow label="Lab Name" value={order?.labName || 'Apollo Diagnostics'} />
                        <DetailRow label="Test Name" value={order?.items?.[0]?.name || 'Full Body Health Checkup'} />
                        <DetailRow label="Appointment Date" value={order?.schedule?.date || order?.testDate || '01 Jan 2024'} />
                        <DetailRow label="Time Slot" value={order?.schedule?.timeSlot || order?.timeSlot || '08:00 AM'} />
                        <View style={styles.statusRow}>
                            <Text style={styles.detailLabel}>Status</Text>
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusText}>Completed</Text>
                            </View>
                        </View>
                    </View>

                    {/* Report Card */}
                    <Text style={styles.sectionHeading}>Report Details</Text>
                    <TouchableOpacity style={styles.reportCard} onPress={handleDownload}>
                        <View style={styles.reportIconBox}>
                            <Ionicons name="document-text" size={scale(24)} color={COLORS.primary} />
                        </View>
                        <View style={styles.reportTextInfo}>
                            <Text style={styles.reportTitle}>View My Report</Text>
                            <Text style={styles.reportSubtitle}>Generated on {order?.updatedAt ? new Date(order.updatedAt).toLocaleDateString() : 'Today'}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={scale(20)} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Bottom Button */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.downloadBtn} onPress={handleDownload}>
                    <Text style={styles.downloadBtnText}>Download Report</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const DetailRow = ({ label, value }) => (
    <View style={styles.infoRow}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    scrollContent: { paddingBottom: hp(12) },
    heroContainer: { height: hp(30), width: '100%', position: 'relative' },
    heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    headerButtons: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: wp(5),
        paddingTop: hp(1)
    },
    iconCircle: {
        width: scale(36),
        height: scale(36),
        borderRadius: scale(18),
        backgroundColor: 'rgba(255,255,255,0.9)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    body: { padding: wp(5), marginTop: -hp(3), backgroundColor: COLORS.white, borderTopLeftRadius: scale(30), borderTopRightRadius: scale(30) },
    mapBox: { height: hp(15), borderRadius: scale(20), overflow: 'hidden', marginBottom: hp(2), elevation: 2 },
    mapImage: { width: '100%', height: '100%' },
    mapOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },

    labInfoSection: { marginBottom: hp(2) },
    labBadgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: hp(0.5) },
    labCategory: { fontSize: moderateScale(13), fontWeight: '700', color: COLORS.primary },
    ratingBox: { flexDirection: 'row', alignItems: 'center', gap: scale(4), backgroundColor: '#F8FAFC', paddingHorizontal: scale(8), paddingVertical: hp(0.5), borderRadius: scale(8) },
    ratingText: { fontSize: moderateScale(12), fontWeight: '800', color: COLORS.text },
    labNameText: { fontSize: moderateScale(20), fontWeight: '900', color: COLORS.text, marginBottom: hp(0.5) },
    linkText: { fontSize: moderateScale(12), fontWeight: '700', color: COLORS.primary, textDecorationLine: 'underline', marginBottom: hp(1.5) },

    addressRow: { flexDirection: 'row', gap: scale(10), alignItems: 'center' },
    addressInfo: { flex: 1, flexDirection: 'row', gap: scale(8), alignItems: 'center' },
    primaryIconBox: { width: scale(36), height: scale(36), borderRadius: scale(10), backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
    addressPara: { flex: 1, fontSize: moderateScale(12), color: COLORS.textSecondary, fontWeight: '600', lineHeight: moderateScale(18) },
    directionActions: { flexDirection: 'row', gap: scale(8) },
    actionIcon: { width: scale(36), height: scale(36), borderRadius: scale(10), backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },

    divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: hp(2) },
    sectionHeading: { fontSize: moderateScale(16), fontWeight: '800', color: COLORS.text, marginBottom: hp(1.5) },

    detailsCard: { backgroundColor: '#F8FAFC', borderRadius: scale(20), padding: scale(15), gap: hp(1.5) },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    detailLabel: { fontSize: moderateScale(13), color: COLORS.textSecondary, fontWeight: '700' },
    detailValue: { fontSize: moderateScale(13), color: COLORS.text, fontWeight: '800' },
    statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    statusBadge: { backgroundColor: '#ECFDF5', paddingHorizontal: scale(12), paddingVertical: hp(0.6), borderRadius: scale(10) },
    statusText: { fontSize: moderateScale(11), fontWeight: '900', color: COLORS.success },

    reportCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: scale(20), padding: scale(15), borderWidth: 1, borderColor: '#EEF2FF', elevation: 2 },
    reportIconBox: { width: scale(48), height: scale(48), borderRadius: scale(15), backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
    reportTextInfo: { flex: 1, marginLeft: scale(15) },
    reportTitle: { fontSize: moderateScale(15), fontWeight: '900', color: COLORS.text },
    reportSubtitle: { fontSize: moderateScale(11), color: COLORS.textSecondary, fontWeight: '600' },

    footer: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: COLORS.white, padding: wp(5), borderTopWidth: 1, borderTopColor: COLORS.border },
    downloadBtn: { backgroundColor: COLORS.primary, borderRadius: scale(15), paddingVertical: hp(1.8), alignItems: 'center', elevation: 4 },
    downloadBtnText: { color: COLORS.white, fontSize: moderateScale(16), fontWeight: '900' },
});

