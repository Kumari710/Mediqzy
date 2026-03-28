import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    StatusBar,
    Image,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

const COLORS = {
    primary: '#23238E',
    white: '#FFFFFF',
    text: '#1A1A2E',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    background: '#F1F5F9',
};

export default function ViewLabReportScreen({ navigation, route }) {
    const { order } = route.params || {};

    const handleDownload = () => {
        Alert.alert('Download', 'Lab report downloaded successfully as PDF.');
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={scale(24)} color={COLORS.white} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>View Lab Report</Text>
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.actionIconBtn}>
                            <Ionicons name="share-social-outline" size={scale(22)} color={COLORS.white} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionIconBtn}>
                            <Ionicons name="print-outline" size={scale(22)} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Professional Document Mockup */}
                    <View style={styles.reportSheet}>
                        {/* Letterhead */}
                        <View style={styles.sheetHeader}>
                            <View style={styles.brandRow}>
                                <Image
                                    source={require('../../images/apollo.png')}
                                    style={styles.labLogoSmall}
                                />
                                <View>
                                    <Text style={styles.brandName}>APOLLO DIAGNOSTICS</Text>
                                    <Text style={styles.certification}>ISO 9001:2015 CERTIFIED LAB</Text>
                                </View>
                            </View>
                            <View style={styles.qrIndicator}>
                                <Ionicons name="qr-code" size={scale(35)} color={COLORS.text} />
                            </View>
                        </View>

                        <View style={styles.sheetDividerPrimary} />

                        {/* Info Header */}
                        <View style={styles.metaDataRow}>
                            <View style={styles.metaHalf}>
                                <LabelValue label="Patient Name" value={order?.patientName || 'Shivakumar'} />
                                <LabelValue label="Age / Gender" value={`${order?.patientAge || '25'} / ${order?.gender || 'Male'}`} />
                                <LabelValue label="Reference" value="Self" />
                            </View>
                            <View style={styles.metaHalf}>
                                <LabelValue label="Report ID" value={order?.orderId || 'LAB975547'} />
                                <LabelValue label="Collection" value={order?.schedule?.date || '01 Jan 2024'} />
                                <LabelValue label="Release Date" value={new Date().toLocaleDateString('en-GB')} />
                            </View>
                        </View>

                        <View style={styles.deptHeader}>
                            <Text style={styles.deptLabel}>DEPARTMENT OF HEMATOLOGY</Text>
                        </View>

                        {/* Data Grid */}
                        <View style={styles.reportGrid}>
                            <View style={styles.gridHeaderRow}>
                                <Text style={[styles.gridHead, { flex: 2 }]}>TEST PARAMETER</Text>
                                <Text style={[styles.gridHead, { flex: 1, textAlign: 'center' }]}>RESULT</Text>
                                <Text style={[styles.gridHead, { flex: 1, textAlign: 'center' }]}>UNITS</Text>
                                <Text style={[styles.gridHead, { flex: 1.5, textAlign: 'right' }]}>NORMAL REF.</Text>
                            </View>

                            <ReportDataRow name="Hemoglobin" value="14.8" unit="g/dL" range="13.5 - 17.5" />
                            <ReportDataRow name="Total WBC Count" value="6,800" unit="cells/cumm" range="4k - 10k" />
                            <ReportDataRow name="RBC Count" value="4.9" unit="mill/cumm" range="4.5 - 5.5" />
                            <ReportDataRow name="Packed Cell Volume" value="43" unit="%" range="40 - 50" />
                            <ReportDataRow name="Platelets" value="2.8" unit="lakhs/cumm" range="1.5 - 4.5" />
                        </View>

                        {/* Footer Signatures */}
                        <View style={styles.sheetFooterSection}>
                            <Text style={styles.interpretNote}>* Interpretation: This report is for information purposes and should be correlated clinically by a qualified physician.</Text>

                            <View style={styles.signArea}>
                                <View style={styles.professionalSignContainer}>
                                    <View style={styles.signatureLine} />
                                    <Text style={styles.doctorNameBold}>Dr. R.K. Varma</Text>
                                    <Text style={styles.doctorRankSub}>MD, Senior Pathologist</Text>
                                    <Text style={styles.regNumberSmall}>MCI Reg No: 88764</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>

                {/* Bottom Footer Button */}
                <View style={styles.screenFooter}>
                    <TouchableOpacity style={styles.primaryDownloadBtn} onPress={handleDownload}>
                        <Ionicons name="document-text-outline" size={scale(20)} color={COLORS.white} />
                        <Text style={styles.btnLabelLarge}>Download PDF Report</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const LabelValue = ({ label, value }) => (
    <View style={styles.lvContainer}>
        <Text style={styles.lvLabel}>{label}</Text>
        <Text style={styles.lvValue}>: {value}</Text>
    </View>
);

const ReportDataRow = ({ name, value, unit, range }) => (
    <View style={styles.gridDataRow}>
        <Text style={[styles.dataTextMain, { flex: 2 }]}>{name}</Text>
        <Text style={[styles.dataTextResult, { flex: 1, textAlign: 'center' }]}>{value}</Text>
        <Text style={[styles.dataTextUnit, { flex: 1, textAlign: 'center' }]}>{unit}</Text>
        <Text style={[styles.dataTextRange, { flex: 1.5, textAlign: 'right' }]}>{range}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    safeArea: { flex: 1 },
    header: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: wp(5),
        paddingVertical: hp(2),
    },
    headerTitle: { fontSize: moderateScale(18), fontWeight: '900', color: COLORS.white },
    headerActions: { flexDirection: 'row', gap: scale(15) },
    actionIconBtn: { padding: scale(4) },
    scrollContent: { padding: wp(4), paddingBottom: hp(12) },

    reportSheet: {
        backgroundColor: COLORS.white,
        borderRadius: scale(4),
        padding: scale(20),
        minHeight: hp(85),
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 15,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: hp(2) },
    brandRow: { flexDirection: 'row', alignItems: 'center', gap: scale(12) },
    labLogoSmall: { width: scale(48), height: scale(48), resizeMode: 'contain' },
    brandName: { fontSize: moderateScale(17), fontWeight: '900', color: COLORS.primary, letterSpacing: 0.5 },
    certification: { fontSize: moderateScale(8), color: COLORS.textSecondary, fontWeight: '700' },

    sheetDividerPrimary: { height: 2, backgroundColor: COLORS.primary, marginBottom: hp(2) },

    metaDataRow: { flexDirection: 'row', justifyContent: 'space-between', gap: scale(10), marginBottom: hp(3) },
    metaHalf: { flex: 1 },
    lvContainer: { flexDirection: 'row', marginBottom: hp(0.5) },
    lvLabel: { width: scale(80), fontSize: moderateScale(10), color: COLORS.textSecondary, fontWeight: '700' },
    lvValue: { flex: 1, fontSize: moderateScale(11), color: COLORS.text, fontWeight: '800' },

    deptHeader: { alignItems: 'center', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F1F5F9', paddingVertical: hp(1), marginBottom: hp(2.5), backgroundColor: '#F8FAFC' },
    deptLabel: { fontSize: moderateScale(12), fontWeight: '900', color: COLORS.primary, letterSpacing: 1 },

    reportGrid: { marginBottom: hp(5) },
    gridHeaderRow: { flexDirection: 'row', borderBottomWidth: 1.5, borderBottomColor: '#64748B', paddingBottom: hp(1), marginBottom: hp(1) },
    gridHead: { fontSize: moderateScale(10), fontWeight: '900', color: COLORS.textSecondary },
    gridDataRow: { flexDirection: 'row', paddingVertical: hp(1.5), borderBottomWidth: 0.5, borderBottomColor: '#E2E8F0' },
    dataTextMain: { fontSize: moderateScale(11), color: COLORS.text, fontWeight: '700' },
    dataTextResult: { fontSize: moderateScale(12), color: COLORS.primary, fontWeight: '900' },
    dataTextUnit: { fontSize: moderateScale(10), color: COLORS.textSecondary, fontWeight: '600' },
    dataTextRange: { fontSize: moderateScale(10), color: COLORS.text, fontWeight: '600' },

    sheetFooterSection: { marginTop: hp(2) },
    interpretNote: { fontSize: moderateScale(9), color: COLORS.textSecondary, fontStyle: 'italic', lineHeight: moderateScale(14), marginBottom: hp(4) },
    signArea: { alignItems: 'flex-end' },
    professionalSignContainer: { alignItems: 'center', width: scale(150) },
    signatureLine: { height: 1.5, backgroundColor: COLORS.text, width: '100%', marginBottom: hp(0.5) },
    doctorNameBold: { fontSize: moderateScale(12), fontWeight: '900', color: COLORS.text },
    doctorRankSub: { fontSize: moderateScale(10), color: COLORS.textSecondary, fontWeight: '600' },
    regNumberSmall: { fontSize: moderateScale(9), color: COLORS.textSecondary },

    screenFooter: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: COLORS.white, padding: wp(5), borderTopWidth: 1, borderTopColor: COLORS.border },
    primaryDownloadBtn: { flexDirection: 'row', backgroundColor: COLORS.primary, borderRadius: scale(15), paddingVertical: hp(2), alignItems: 'center', justifyContent: 'center', gap: scale(12), elevation: 3 },
    btnLabelLarge: { color: COLORS.white, fontSize: moderateScale(16), fontWeight: '900' },
});



