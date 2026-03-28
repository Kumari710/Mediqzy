import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    TextInput,
    Alert,
    FlatList,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import {
    scheduleMedicineReminder,
    cancelMedicineReminder,
    getMedicineReminders
} from '../../Utils/localNotifications';

export default function MedicineReminderScreen({ navigation }) {
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingReminder, setEditingReminder] = useState(null);

    // Form state
    const [medicineName, setMedicineName] = useState('');
    const [dosage, setDosage] = useState('');
    const [hour, setHour] = useState('8');
    const [minute, setMinute] = useState('00');
    const [isAM, setIsAM] = useState(true);

    useEffect(() => {
        loadReminders();
    }, []);

    const loadReminders = async () => {
        setLoading(true);
        const data = await getMedicineReminders();
        setReminders(data);
        setLoading(false);
    };

    const resetForm = () => {
        setMedicineName('');
        setDosage('');
        setHour('8');
        setMinute('00');
        setIsAM(true);
        setEditingReminder(null);
    };

    const openModal = (reminder = null) => {
        if (reminder) {
            setEditingReminder(reminder);
            setMedicineName(reminder.medicineName);
            setDosage(reminder.dosage || '');
            const h = reminder.hour % 12 || 12;
            setHour(h.toString());
            setMinute(reminder.minute.toString().padStart(2, '0'));
            setIsAM(reminder.hour < 12);
        } else {
            resetForm();
        }
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!medicineName.trim()) {
            Alert.alert('Required', 'Please enter medicine name');
            return;
        }

        // Convert to 24-hour format
        let h = parseInt(hour) || 8;
        if (!isAM && h !== 12) h += 12;
        if (isAM && h === 12) h = 0;
        const m = parseInt(minute) || 0;

        const reminder = {
            id: editingReminder?.id || Date.now().toString(),
            medicineName: medicineName.trim(),
            dosage: dosage.trim(),
            hour: h,
            minute: m,
            daily: true,
        };

        const result = await scheduleMedicineReminder(reminder);

        if (result.success) {
            Alert.alert('Success', 'Reminder set successfully!');
            setModalVisible(false);
            loadReminders();
        } else {
            Alert.alert('Error', result.error || 'Failed to set reminder');
        }
    };

    const handleDelete = (id) => {
        Alert.alert(
            'Delete Reminder',
            'Are you sure you want to delete this reminder?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await cancelMedicineReminder(id);
                        loadReminders();
                    },
                },
            ]
        );
    };

    const formatTime = (h, m) => {
        const hour12 = h % 12 || 12;
        const ampm = h < 12 ? 'AM' : 'PM';
        return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;
    };

    const renderReminder = ({ item }) => (
        <View style={styles.reminderCard}>
            <View style={styles.reminderLeft}>
                <View style={styles.pillIcon}>
                    <Text style={styles.pillEmoji}>💊</Text>
                </View>
                <View style={styles.reminderInfo}>
                    <Text style={styles.medicineName}>{item.medicineName}</Text>
                    {item.dosage ? <Text style={styles.dosageText}>{item.dosage}</Text> : null}
                    <Text style={styles.timeText}>{formatTime(item.hour, item.minute)}</Text>
                </View>
            </View>
            <View style={styles.reminderActions}>
                <TouchableOpacity style={styles.editBtn} onPress={() => openModal(item)}>
                    <Ionicons name="pencil-outline" size={moderateScale(18)} color="#23238E" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                    <Ionicons name="trash-outline" size={moderateScale(18)} color="#EF4444" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={moderateScale(24)} color="#222" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Medicine Reminders</Text>
                    <TouchableOpacity onPress={() => openModal()} style={styles.addBtn}>
                        <Ionicons name="add" size={moderateScale(26)} color="#23238E" />
                    </TouchableOpacity>
                </View>

                {reminders.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyEmoji}>⏰</Text>
                        <Text style={styles.emptyTitle}>No Reminders Set</Text>
                        <Text style={styles.emptyText}>Add a reminder to never miss your medicine</Text>
                        <TouchableOpacity style={styles.addReminderBtn} onPress={() => openModal()}>
                            <Ionicons name="add-circle" size={moderateScale(22)} color="#fff" />
                            <Text style={styles.addReminderText}>Add Reminder</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        data={reminders}
                        renderItem={renderReminder}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                )}

                {/* Add/Edit Modal */}
                <Modal
                    visible={modalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>
                                    {editingReminder ? 'Edit Reminder' : 'Add Reminder'}
                                </Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <Ionicons name="close" size={moderateScale(26)} color="#666" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                {/* Medicine Name */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Medicine Name *</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={medicineName}
                                        onChangeText={setMedicineName}
                                        placeholder="e.g., Paracetamol"
                                        placeholderTextColor="#999"
                                    />
                                </View>

                                {/* Dosage */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Dosage (optional)</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={dosage}
                                        onChangeText={setDosage}
                                        placeholder="e.g., 1 tablet, 5ml"
                                        placeholderTextColor="#999"
                                    />
                                </View>

                                {/* Time Picker */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Reminder Time</Text>
                                    <View style={styles.timePickerRow}>
                                        <TextInput
                                            style={styles.timeInput}
                                            value={hour}
                                            onChangeText={setHour}
                                            keyboardType="number-pad"
                                            maxLength={2}
                                            placeholder="8"
                                        />
                                        <Text style={styles.timeSeparator}>:</Text>
                                        <TextInput
                                            style={styles.timeInput}
                                            value={minute}
                                            onChangeText={setMinute}
                                            keyboardType="number-pad"
                                            maxLength={2}
                                            placeholder="00"
                                        />
                                        <View style={styles.ampmContainer}>
                                            <TouchableOpacity
                                                style={[styles.ampmBtn, isAM && styles.ampmActive]}
                                                onPress={() => setIsAM(true)}
                                            >
                                                <Text style={[styles.ampmText, isAM && styles.ampmTextActive]}>AM</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.ampmBtn, !isAM && styles.ampmActive]}
                                                onPress={() => setIsAM(false)}
                                            >
                                                <Text style={[styles.ampmText, !isAM && styles.ampmTextActive]}>PM</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>

                                {/* Repeat Info */}
                                <View style={styles.infoBox}>
                                    <Ionicons name="repeat" size={moderateScale(18)} color="#3B82F6" />
                                    <Text style={styles.infoText}>This reminder will repeat daily at the selected time</Text>
                                </View>
                            </ScrollView>

                            {/* Save Button */}
                            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                                <Text style={styles.saveBtnText}>
                                    {editingReminder ? 'Update Reminder' : 'Set Reminder'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
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
    addBtn: { width: scale(40), alignItems: 'flex-end', padding: scale(4) },

    listContent: { padding: wp(4) },

    reminderCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderRadius: scale(14),
        padding: scale(16),
        marginBottom: verticalScale(12),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    reminderLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    pillIcon: {
        width: scale(50),
        height: scale(50),
        borderRadius: scale(12),
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: scale(14),
    },
    pillEmoji: { fontSize: moderateScale(24) },
    reminderInfo: { flex: 1 },
    medicineName: { fontSize: moderateScale(16), fontWeight: '600', color: '#1F2937' },
    dosageText: { fontSize: moderateScale(13), color: '#6B7280', marginTop: verticalScale(2) },
    timeText: { fontSize: moderateScale(14), color: '#23238E', fontWeight: '600', marginTop: verticalScale(4) },
    reminderActions: { flexDirection: 'row', gap: scale(8) },
    editBtn: { padding: scale(8), backgroundColor: '#EEF2FF', borderRadius: scale(8) },
    deleteBtn: { padding: scale(8), backgroundColor: '#FEF2F2', borderRadius: scale(8) },

    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: hp(10) },
    emptyEmoji: { fontSize: moderateScale(60), marginBottom: verticalScale(16) },
    emptyTitle: { fontSize: moderateScale(20), fontWeight: '700', color: '#374151' },
    emptyText: { fontSize: moderateScale(14), color: '#9CA3AF', marginTop: verticalScale(8), textAlign: 'center' },
    addReminderBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#23238E',
        paddingHorizontal: scale(24),
        paddingVertical: verticalScale(14),
        borderRadius: scale(25),
        marginTop: verticalScale(24),
    },
    addReminderText: { color: '#fff', fontWeight: '600', fontSize: moderateScale(15), marginLeft: scale(8) },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: scale(24),
        borderTopRightRadius: scale(24),
        padding: wp(5),
        maxHeight: hp(80),
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: verticalScale(20),
    },
    modalTitle: { fontSize: moderateScale(20), fontWeight: '700', color: '#1F2937' },

    inputGroup: { marginBottom: verticalScale(20) },
    inputLabel: { fontSize: moderateScale(14), fontWeight: '600', color: '#374151', marginBottom: verticalScale(8) },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: scale(12),
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(14),
        fontSize: moderateScale(15),
        color: '#1F2937',
        backgroundColor: '#FAFAFA',
    },

    timePickerRow: { flexDirection: 'row', alignItems: 'center' },
    timeInput: {
        width: scale(60),
        height: scale(60),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: scale(12),
        textAlign: 'center',
        fontSize: moderateScale(24),
        fontWeight: '700',
        color: '#1F2937',
        backgroundColor: '#FAFAFA',
    },
    timeSeparator: { fontSize: moderateScale(30), fontWeight: '700', color: '#374151', marginHorizontal: scale(8) },
    ampmContainer: { flexDirection: 'row', marginLeft: scale(16), gap: scale(4) },
    ampmBtn: {
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(10),
        borderRadius: scale(8),
        backgroundColor: '#F3F4F6',
    },
    ampmActive: { backgroundColor: '#23238E' },
    ampmText: { fontSize: moderateScale(14), fontWeight: '600', color: '#6B7280' },
    ampmTextActive: { color: '#fff' },

    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFF6FF',
        padding: scale(14),
        borderRadius: scale(10),
        marginBottom: verticalScale(20),
    },
    infoText: { flex: 1, fontSize: moderateScale(13), color: '#1E40AF', marginLeft: scale(10) },

    saveBtn: {
        backgroundColor: '#23238E',
        paddingVertical: verticalScale(16),
        borderRadius: scale(30),
        alignItems: 'center',
        marginTop: verticalScale(10),
    },
    saveBtnText: { color: '#fff', fontWeight: '700', fontSize: moderateScale(16) },
});
