import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    ActivityIndicator,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import { savePatient, updatePatient } from '../../Utils/firebaseDatabase';

export default function AddPatientScreen({ navigation, route }) {
    const editPatient = route?.params?.patient;
    const isEditing = !!editPatient;

    const [name, setName] = useState(editPatient?.name || '');
    const [age, setAge] = useState(editPatient?.age?.toString() || '');
    const [phone, setPhone] = useState(editPatient?.phone || '');
    const [gender, setGender] = useState(editPatient?.gender || 'Male');
    const [relation, setRelation] = useState(editPatient?.relation || 'Self');
    const [loading, setLoading] = useState(false);

    const relations = ['Self', 'Spouse', 'Child', 'Parent', 'Other'];
    const genders = ['Male', 'Female', 'Other'];

    const handleSave = async () => {
        if (!name || !age) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        setLoading(true);
        const patientData = {
            name,
            age,
            phone,
            gender,
            relation,
            initial: name.charAt(0).toUpperCase(),
            relationColor: relation === 'Self' ? '#E53935' : '#23238E'
        };

        const result = isEditing
            ? await updatePatient(editPatient.id, patientData)
            : await savePatient(patientData);

        setLoading(false);

        if (result.success) {
            Alert.alert('Success', `Patient ${isEditing ? 'updated' : 'added'} successfully`, [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } else {
            Alert.alert('Error', result.error || `Failed to ${isEditing ? 'update' : 'add'} patient`);
        }
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={moderateScale(24)} color="#222" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{isEditing ? 'Edit Patient' : 'Add New Patient'}</Text>
                </View>

                <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: scale(20) }}>
                    <Text style={styles.label}>Full Name *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter full name"
                        value={name}
                        onChangeText={setName}
                    />

                    <Text style={styles.label}>Age *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter age"
                        value={age}
                        onChangeText={setAge}
                        keyboardType="numeric"
                    />

                    <Text style={styles.label}>Phone Number</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter phone number"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                    />

                    <Text style={styles.label}>Gender</Text>
                    <View style={styles.chipRow}>
                        {genders.map((g) => (
                            <TouchableOpacity
                                key={g}
                                style={[styles.chip, gender === g && styles.chipSelected]}
                                onPress={() => setGender(g)}
                            >
                                <Text style={[styles.chipText, gender === g && styles.chipTextSelected]}>{g}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.label}>Relation</Text>
                    <View style={styles.chipRow}>
                        {relations.map((r) => (
                            <TouchableOpacity
                                key={r}
                                style={[styles.chip, relation === r && styles.chipSelected]}
                                onPress={() => setRelation(r)}
                            >
                                <Text style={[styles.chipText, relation === r && styles.chipTextSelected]}>{r}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>

                <View style={styles.bottomContainer}>
                    <TouchableOpacity
                        style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.saveBtnText}>{isEditing ? 'Update Patient' : 'Save Patient'}</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    safeArea: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: wp(4),
        paddingVertical: hp(2),
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backBtn: { padding: scale(4) },
    headerTitle: { fontSize: moderateScale(18), fontWeight: '600', color: '#222', marginLeft: scale(12) },
    label: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: '#444',
        marginTop: verticalScale(20),
        marginBottom: verticalScale(8),
    },
    input: {
        backgroundColor: '#f8f8f8',
        borderRadius: scale(8),
        padding: scale(12),
        fontSize: moderateScale(14),
        color: '#222',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: scale(10),
        marginTop: verticalScale(4),
    },
    chip: {
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(8),
        borderRadius: scale(20),
        borderWidth: 1,
        borderColor: '#e0e0e0',
        backgroundColor: '#fff',
    },
    chipSelected: {
        backgroundColor: '#23238E',
        borderColor: '#23238E',
    },
    chipText: {
        fontSize: moderateScale(13),
        color: '#666',
        fontWeight: '500',
    },
    chipTextSelected: {
        color: '#fff',
    },
    bottomContainer: {
        padding: scale(20),
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    saveBtn: {
        backgroundColor: '#23238E',
        borderRadius: scale(12),
        paddingVertical: verticalScale(16),
        alignItems: 'center',
    },
    saveBtnDisabled: {
        opacity: 0.7,
    },
    saveBtnText: {
        color: '#fff',
        fontSize: moderateScale(16),
        fontWeight: '700',
    },
});
