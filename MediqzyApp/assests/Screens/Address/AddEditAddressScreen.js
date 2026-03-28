import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    ActivityIndicator,
    Alert,
    StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import { saveAddress, updateAddress } from '../../Utils/firebaseDatabase';

export default function AddEditAddressScreen({ navigation, route }) {
    const existingAddress = route?.params?.address;
    const isEditing = !!existingAddress;

    const [form, setForm] = useState({
        houseNo: existingAddress?.houseNo || '',
        street: existingAddress?.street || '',
        landmark: existingAddress?.landmark || '',
        city: existingAddress?.city || 'Chennai',
        state: existingAddress?.state || 'Tamil Nadu',
        pincode: existingAddress?.pincode || '',
        phone: existingAddress?.phone || '',
        type: existingAddress?.type || 'Home', // Home, Work, Other
    });

    const [loading, setLoading] = useState(false);

    const addressTypes = ['Home', 'Work', 'Other'];

    const handleSave = async () => {
        const { houseNo, street, pincode, phone } = form;
        if (!houseNo || !street || !pincode || !phone) {
            Alert.alert('Required Fields', 'Please fill in House No, Street, Pincode and Phone.');
            return;
        }

        setLoading(true);
        const result = isEditing
            ? await updateAddress(existingAddress.id, form)
            : await saveAddress(form);

        setLoading(false);

        if (result.success) {
            Alert.alert('Success', `Address ${isEditing ? 'updated' : 'saved'} successfully`, [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } else {
            Alert.alert('Error', result.error || 'Failed to save address');
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={moderateScale(24)} color="#222" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{isEditing ? 'Edit Address' : 'Add New Address'}</Text>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <Text style={styles.label}>House / Flat / Office No. *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. 123/A"
                        value={form.houseNo}
                        onChangeText={(txt) => setForm({ ...form, houseNo: txt })}
                    />

                    <Text style={styles.label}>Street / Area *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Rajaji Nagar Main Rd"
                        value={form.street}
                        onChangeText={(txt) => setForm({ ...form, street: txt })}
                    />

                    <Text style={styles.label}>Landmark (Optional)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Near Ganesha Temple"
                        value={form.landmark}
                        onChangeText={(txt) => setForm({ ...form, landmark: txt })}
                    />

                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>City</Text>
                            <TextInput
                                style={styles.input}
                                value={form.city}
                                onChangeText={(txt) => setForm({ ...form, city: txt })}
                            />
                        </View>
                        <View style={{ width: scale(16) }} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Pincode *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="600017"
                                keyboardType="numeric"
                                value={form.pincode}
                                onChangeText={(txt) => setForm({ ...form, pincode: txt })}
                            />
                        </View>
                    </View>

                    <Text style={styles.label}>Phone Number *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter mobile number"
                        keyboardType="phone-pad"
                        value={form.phone}
                        onChangeText={(txt) => setForm({ ...form, phone: txt })}
                    />

                    <Text style={styles.label}>Address Type</Text>
                    <View style={styles.typeRow}>
                        {addressTypes.map((type) => (
                            <TouchableOpacity
                                key={type}
                                style={[styles.typeBtn, form.type === type && styles.activeTypeBtn]}
                                onPress={() => setForm({ ...form, type })}
                            >
                                <Ionicons
                                    name={type === 'Home' ? 'home' : type === 'Work' ? 'briefcase' : 'location'}
                                    size={moderateScale(18)}
                                    color={form.type === type ? '#fff' : '#666'}
                                />
                                <Text style={[styles.typeBtnText, form.type === type && styles.activeTypeBtnText]}>{type}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={{ height: verticalScale(100) }} />
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.saveBtn, loading && styles.disabledBtn]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.saveBtnText}>{isEditing ? 'Update Address' : 'Save Address'}</Text>
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
    headerTitle: { fontSize: moderateScale(18), fontWeight: '700', color: '#222', marginLeft: scale(12) },
    scrollContent: { padding: scale(20) },
    label: { fontSize: moderateScale(14), fontWeight: '600', color: '#444', marginTop: verticalScale(16), marginBottom: verticalScale(8) },
    input: {
        backgroundColor: '#F7F8FA',
        borderRadius: scale(12),
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(14),
        fontSize: moderateScale(15),
        color: '#222',
        borderWidth: 1,
        borderColor: '#E6E8EB',
    },
    row: { flexDirection: 'row', alignItems: 'center' },
    typeRow: { flexDirection: 'row', gap: scale(12), marginTop: verticalScale(8) },
    typeBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: scale(6),
        backgroundColor: '#F7F8FA',
        paddingVertical: verticalScale(12),
        borderRadius: scale(12),
        borderWidth: 1,
        borderColor: '#E6E8EB',
    },
    activeTypeBtn: { backgroundColor: '#23238E', borderColor: '#23238E' },
    typeBtnText: { fontSize: moderateScale(14), fontWeight: '600', color: '#666' },
    activeTypeBtnText: { color: '#fff' },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: scale(20),
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    saveBtn: {
        backgroundColor: '#23238E',
        borderRadius: scale(12),
        paddingVertical: verticalScale(18),
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#23238E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    saveBtnText: { color: '#fff', fontSize: moderateScale(16), fontWeight: '700' },
    disabledBtn: { opacity: 0.7 },
});
