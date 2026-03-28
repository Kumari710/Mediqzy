import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

const THEME = {
    primary: '#1E3A8A',
    primaryLight: '#EEF2FF',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: '#1E293B',
    textSecondary: '#64748B',
};

export default function CheckupHistoryScreen({ navigation }) {
    const history = [
        { id: 1, date: 'Jan 7, 2026', time: '8:30 AM', score: 88, status: 'Good', color: '#27AE60' },
        { id: 2, date: 'Jan 5, 2026', time: '9:00 AM', score: 82, status: 'Good', color: '#27AE60' },
        { id: 3, date: 'Jan 3, 2026', time: '8:45 AM', score: 85, status: 'Good', color: '#27AE60' },
        { id: 4, date: 'Dec 30, 2025', time: '10:15 AM', score: 78, status: 'Normal', color: '#F1C40F' },
        { id: 5, date: 'Dec 25, 2025', time: '9:30 AM', score: 92, status: 'Excellent', color: '#2ECC71' },
        { id: 6, date: 'Dec 20, 2025', time: '8:00 AM', score: 85, status: 'Good', color: '#27AE60' },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={THEME.background} />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={moderateScale(24)} color={THEME.primary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Checkup History</Text>
                    <View style={{ width: scale(40) }} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {history.length > 0 ? (
                        <View style={styles.list}>
                            {history.map((checkup) => (
                                <TouchableOpacity key={checkup.id} style={styles.card} activeOpacity={0.7}>
                                    <View style={styles.left}>
                                        <View style={styles.iconContainer}>
                                            <Ionicons name="document-text" size={scale(24)} color={THEME.primary} />
                                        </View>
                                        <View style={styles.info}>
                                            <Text style={styles.date}>{checkup.date}</Text>
                                            <Text style={styles.time}>{checkup.time}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.right}>
                                        <View style={[styles.scoreCircle, { backgroundColor: `${checkup.color}15` }]}>
                                            <Text style={[styles.scoreValue, { color: checkup.color }]}>{checkup.score}</Text>
                                        </View>
                                        <Text style={[styles.scoreStatus, { color: checkup.color }]}>{checkup.status}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={scale(20)} color="#CBD5E1" />
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="medical-outline" size={scale(64)} color="#ccc" />
                            <Text style={styles.emptyText}>No checkup history available yet.</Text>
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: THEME.surface },
    safeArea: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: wp(4),
        paddingVertical: hp(1.5),
        backgroundColor: THEME.background,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    backButton: { padding: scale(8) },
    headerTitle: { fontSize: moderateScale(18), fontWeight: '700', color: THEME.primary },
    scrollContent: { paddingVertical: hp(2) },
    list: { paddingHorizontal: wp(5) },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.background,
        borderRadius: scale(16),
        padding: scale(16),
        marginBottom: verticalScale(12),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    iconContainer: {
        width: scale(52),
        height: scale(52),
        borderRadius: scale(14),
        backgroundColor: THEME.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    info: { marginLeft: scale(14) },
    date: { fontSize: moderateScale(16), fontWeight: '600', color: THEME.text },
    time: { fontSize: moderateScale(13), color: THEME.textSecondary, marginTop: verticalScale(2) },
    right: { alignItems: 'center', marginRight: scale(10) },
    scoreCircle: {
        width: scale(50),
        height: scale(50),
        borderRadius: scale(25),
        alignItems: 'center',
        justifyContent: 'center',
    },
    scoreValue: { fontSize: moderateScale(18), fontWeight: '700' },
    scoreStatus: { fontSize: moderateScale(12), fontWeight: '600', marginTop: verticalScale(2) },
    emptyState: { alignItems: 'center', marginTop: hp(15) },
    emptyText: { fontSize: moderateScale(16), color: '#888', textAlign: 'center', marginTop: verticalScale(16) },
});
