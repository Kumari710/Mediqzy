import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import { getAddresses, setSelectedAddress, deleteAddress } from '../../Utils/firebaseDatabase';
import { getCurrentUser } from '../../Utils/firebaseAuth';

export default function AddressListScreen({ navigation, route }) {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const bookingDetails = route?.params?.bookingDetails;
    const isSelectionFlow = !!bookingDetails;

    useEffect(() => {
        loadAddresses();
    }, []);

    const loadAddresses = async () => {
        setLoading(true);
        const result = await getAddresses();
        if (result.success) {
            setAddresses(result.data);
        }
        setLoading(false);
    };

    const handleSelectAddress = async (address) => {
        if (isSelectionFlow) {
            await setSelectedAddress(address.id);
            navigation.navigate(bookingDetails.type === 'lab' ? 'LabPaymentScreen' : 'PaymentScreen', {
                bookingDetails: {
                    ...bookingDetails,
                    location: {
                        address: `${address.houseNo}, ${address.street}, ${address.city} - ${address.pincode}`,
                        type: address.type,
                        id: address.id
                    }
                }
            });
        } else {
            await setSelectedAddress(address.id);
            loadAddresses();
        }
    };

    const handleDelete = (id) => {
        Alert.alert('Delete Address', 'Are you sure you want to delete this address?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    const result = await deleteAddress(id);
                    if (result.success) loadAddresses();
                }
            }
        ]);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={moderateScale(24)} color="#222" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>My Addresses</Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('AddEditAddressScreen')}
                        style={styles.addIconBtn}
                    >
                        <Ionicons name="add" size={moderateScale(28)} color="#23238E" />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={styles.centered}>
                        <ActivityIndicator size="large" color="#23238E" />
                    </View>
                ) : (
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        {addresses.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="location-outline" size={moderateScale(80)} color="#ccc" />
                                <Text style={styles.emptyText}>No addresses saved yet</Text>
                                <TouchableOpacity
                                    style={styles.addBtn}
                                    onPress={() => navigation.navigate('AddEditAddressScreen')}
                                >
                                    <Text style={styles.addBtnText}>Add New Address</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            addresses.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[
                                        styles.addressCard,
                                        item.isDefault && styles.activeCard
                                    ]}
                                    onPress={() => handleSelectAddress(item)}
                                >
                                    <View style={styles.cardHeader}>
                                        <View style={styles.typeRow}>
                                            <Ionicons
                                                name={item.type === 'Home' ? 'home' : item.type === 'Work' ? 'briefcase' : 'location'}
                                                size={moderateScale(18)}
                                                color="#23238E"
                                            />
                                            <Text style={styles.addressType}>{item.type}</Text>
                                        </View>
                                        <View style={styles.actionRow}>
                                            <TouchableOpacity onPress={() => navigation.navigate('AddEditAddressScreen', { address: item })}>
                                                <Ionicons name="create-outline" size={moderateScale(20)} color="#666" />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => handleDelete(item.id)} style={{ marginLeft: scale(12) }}>
                                                <Ionicons name="trash-outline" size={moderateScale(20)} color="#FF6B6B" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <Text style={styles.addressName}>{item.houseNo}, {item.street}</Text>
                                    <Text style={styles.addressDetails}>{item.city}, {item.state} - {item.pincode}</Text>
                                    <Text style={styles.phoneText}>Phone: {item.phone}</Text>

                                    {item.isDefault && (
                                        <View style={styles.defaultBadge}>
                                            <Ionicons name="checkmark-circle" size={moderateScale(14)} color="#fff" />
                                            <Text style={styles.defaultText}>Selected</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))
                        )}
                    </ScrollView>
                )}
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FB' },
    safeArea: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: wp(4),
        paddingVertical: hp(2),
        backgroundColor: '#fff',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    backBtn: { padding: scale(4) },
    headerTitle: { flex: 1, fontSize: moderateScale(18), fontWeight: '700', color: '#222', marginLeft: scale(12) },
    addIconBtn: { padding: scale(4) },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { padding: scale(20) },
    emptyState: { alignItems: 'center', marginTop: hp(15) },
    emptyText: { fontSize: moderateScale(16), color: '#888', marginTop: verticalScale(16), marginBottom: verticalScale(24) },
    addBtn: { backgroundColor: '#23238E', paddingHorizontal: scale(24), paddingVertical: verticalScale(14), borderRadius: scale(12) },
    addBtnText: { color: '#fff', fontWeight: '700', fontSize: moderateScale(15) },
    addressCard: {
        backgroundColor: '#fff',
        borderRadius: scale(16),
        padding: scale(16),
        marginBottom: verticalScale(16),
        borderWidth: 1,
        borderColor: '#E6E8EB',
        elevation: 3,
        shadowColor: '#23238E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    activeCard: { borderColor: '#23238E', backgroundColor: '#F5F7FF' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: verticalScale(12) },
    typeRow: { flexDirection: 'row', alignItems: 'center', gap: scale(6) },
    addressType: { fontSize: moderateScale(14), fontWeight: '700', color: '#23238E' },
    actionRow: { flexDirection: 'row', alignItems: 'center' },
    addressName: { fontSize: moderateScale(15), fontWeight: '600', color: '#222', marginBottom: verticalScale(4) },
    addressDetails: { fontSize: moderateScale(13), color: '#666', lineHeight: moderateScale(18) },
    phoneText: { fontSize: moderateScale(13), color: '#666', marginTop: verticalScale(8) },
    defaultBadge: {
        position: 'absolute',
        top: -10,
        right: 16,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#23238E',
        paddingHorizontal: scale(10),
        paddingVertical: verticalScale(4),
        borderRadius: scale(20),
        gap: scale(4),
    },
    defaultText: { color: '#fff', fontSize: moderateScale(10), fontWeight: '800', textTransform: 'uppercase' },
});
