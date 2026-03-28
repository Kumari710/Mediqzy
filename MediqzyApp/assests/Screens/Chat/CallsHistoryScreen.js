import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import { SafeAreaView } from 'react-native-safe-area-context';

const callHistory = [
    {
        id: 1,
        doctor: 'Dr. Suresh Tanmani',
        type: 'Incoming',
        time: 'Today, 10:30 AM',
        duration: '05:22',
        status: 'received',
    },
    {
        id: 2,
        doctor: 'Dr. Suresh Tanmani',
        type: 'Outgoing',
        time: 'Yesterday, 04:15 PM',
        duration: '02:10',
        status: 'dialed',
    },
    {
        id: 3,
        doctor: 'Dr. Suresh Tanmani',
        type: 'Missed',
        time: 'Yesterday, 11:00 AM',
        duration: '-',
        status: 'missed',
    },
    {
        id: 4,
        doctor: 'Dr. Suresh Tanmani',
        type: 'Incoming',
        time: '20 Jan, 09:00 AM',
        duration: '10:45',
        status: 'received',
    },
];

export default function CallsHistoryScreen({ navigation }) {
    const [selectedTab, setSelectedTab] = useState('All');

    const filteredCalls = selectedTab === 'All'
        ? callHistory
        : callHistory.filter(call => call.type === selectedTab);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={moderateScale(24)} color="#222" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Consultation Calls</Text>
            </View>

            {/* Tabs */}
            <View style={styles.tabBar}>
                {['All', 'Incoming', 'Outgoing', 'Missed'].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, selectedTab === tab && styles.activeTab]}
                        onPress={() => setSelectedTab(tab)}
                    >
                        <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                {filteredCalls.map((call) => (
                    <TouchableOpacity key={call.id} style={styles.callItem}>
                        <View style={styles.avatarContainer}>
                            <Image source={require('../../images/IndianDoctor.png')} style={styles.avatar} />
                            <View style={[styles.statusIndicator, call.status === 'missed' && { backgroundColor: '#E53935' }]} />
                        </View>
                        <View style={styles.callInfo}>
                            <Text style={styles.doctorName}>{call.doctor}</Text>
                            <View style={styles.typeRow}>
                                <Ionicons
                                    name={
                                        call.status === 'received' ? "call-outline" :
                                            call.status === 'dialed' ? "arrow-up-outline" : "close-outline"
                                    }
                                    size={moderateScale(14)}
                                    color={call.status === 'missed' ? '#E53935' : '#888'}
                                />
                                <Text style={[styles.timeText, call.status === 'missed' && { color: '#E53935' }]}>
                                    {call.time}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.rightAction}>
                            {call.duration !== '-' && <Text style={styles.durationText}>{call.duration}</Text>}
                            <TouchableOpacity style={styles.callBtn} onPress={() => navigation.navigate('CallScreen', { doctor: { name: call.doctor } })}>
                                <Ionicons name="call" size={moderateScale(20)} color="#23238E" />
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F8F8' },
    header: {
        paddingHorizontal: wp(4),
        paddingVertical: hp(2),
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: { fontSize: moderateScale(18), fontWeight: 'bold', color: '#222', marginLeft: scale(12) },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingHorizontal: wp(4),
        paddingBottom: hp(1),
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    tab: {
        paddingVertical: hp(1),
        paddingHorizontal: wp(4),
        borderRadius: scale(20),
        marginRight: scale(8),
    },
    activeTab: {
        backgroundColor: '#F0F4FF',
    },
    tabText: {
        fontSize: moderateScale(13),
        color: '#888',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#23238E',
        fontWeight: 'bold',
    },
    callItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: scale(16),
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    avatarContainer: {
        position: 'relative',
        marginRight: scale(12),
    },
    avatar: {
        width: scale(50),
        height: scale(50),
        borderRadius: scale(25),
    },
    statusIndicator: {
        position: 'absolute',
        bottom: scale(2),
        right: scale(2),
        width: scale(12),
        height: scale(12),
        borderRadius: scale(6),
        backgroundColor: '#4CAF50',
        borderWidth: 2,
        borderColor: '#fff',
    },
    callInfo: {
        flex: 1,
    },
    doctorName: {
        fontSize: moderateScale(16),
        fontWeight: 'bold',
        color: '#222',
    },
    typeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: verticalScale(4),
        gap: scale(4),
    },
    timeText: {
        fontSize: moderateScale(12),
        color: '#888',
    },
    rightAction: {
        alignItems: 'flex-end',
        gap: verticalScale(8),
    },
    durationText: {
        fontSize: moderateScale(11),
        color: '#888',
    },
    callBtn: {
        width: scale(36),
        height: scale(36),
        borderRadius: scale(18),
        backgroundColor: '#F0F4FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
