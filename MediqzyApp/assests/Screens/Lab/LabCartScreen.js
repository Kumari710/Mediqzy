import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    StatusBar,
    Alert,
    Modal,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import {
    getLabCartItems,
    removeFromLabCart,
    getLabCartTotal,
    clearLabCart,
} from '../../Utils/firebaseLabStorage';

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
    danger: '#EF4444',
};

export default function LabCartScreen() {
    const navigation = useNavigation();
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totals, setTotals] = useState({ subtotal: 0, taxes: 0, total: 0 });
    
    // Patient details state
    const [patientDetails, setPatientDetails] = useState(null);
    const [savedPatients, setSavedPatients] = useState([]);
    const [showPatientModal, setShowPatientModal] = useState(false);
    const [showAddPatientModal, setShowAddPatientModal] = useState(false);
    const [newPatient, setNewPatient] = useState({
        name: '',
        age: '',
        gender: 'Male',
        phone: '',
        relation: 'Self',
    });

    // Load cart when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadCart();
            loadPatientDetails();
        }, [])
    );

    const loadPatientDetails = async () => {
        try {
            // Load saved patients list
            const savedPatientsData = await AsyncStorage.getItem('@saved_patients');
            if (savedPatientsData) {
                const patients = JSON.parse(savedPatientsData);
                setSavedPatients(patients);
                // Set first patient as selected if no patient is selected
                if (patients.length > 0 && !patientDetails) {
                    setPatientDetails(patients[0]);
                }
            }
            
            // If no saved patients, try to get from user data
            if (!savedPatientsData || JSON.parse(savedPatientsData).length === 0) {
                const userData = await AsyncStorage.getItem('@user_data');
                if (userData) {
                    const user = JSON.parse(userData);
                    const defaultPatient = {
                        id: 'self',
                        name: user.name || user.email?.split('@')[0] || 'Patient',
                        age: user.age || '25',
                        gender: user.gender || 'Male',
                        phone: user.phone || user.email || '',
                        relation: 'Self',
                    };
                    setPatientDetails(defaultPatient);
                    setSavedPatients([defaultPatient]);
                    await AsyncStorage.setItem('@saved_patients', JSON.stringify([defaultPatient]));
                }
            }
        } catch (error) {
            console.log('Error loading patient details:', error);
        }
    };

    const handleAddNewPatient = async () => {
        if (!newPatient.name.trim()) {
            Alert.alert('Error', 'Please enter patient name');
            return;
        }
        if (!newPatient.age.trim()) {
            Alert.alert('Error', 'Please enter patient age');
            return;
        }
        
        const patient = {
            id: Date.now().toString(),
            ...newPatient,
        };
        
        const updatedPatients = [...savedPatients, patient];
        setSavedPatients(updatedPatients);
        setPatientDetails(patient);
        await AsyncStorage.setItem('@saved_patients', JSON.stringify(updatedPatients));
        
        setNewPatient({ name: '', age: '', gender: 'Male', phone: '', relation: 'Self' });
        setShowAddPatientModal(false);
    };

    const handleSelectPatient = (patient) => {
        setPatientDetails(patient);
        setShowPatientModal(false);
    };

    const loadCart = async () => {
        setLoading(true);
        const items = await getLabCartItems();
        const cartTotals = await getLabCartTotal();
        setCart(items);
        setTotals(cartTotals);
        setLoading(false);
    };

    const handleRemoveItem = async (id) => {
        Alert.alert(
            'Remove Item',
            'Are you sure you want to remove this test from your cart?',
            [
                { text: 'Keep It', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        const updatedCart = await removeFromLabCart(id);
                        setCart(updatedCart);
                        const cartTotals = await getLabCartTotal();
                        setTotals(cartTotals);
                    }
                }
            ]
        );
    };

    const handleClearCart = async () => {
        Alert.alert(
            'Empty Cart',
            'Remove all tests from your cart?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear All',
                    style: 'destructive',
                    onPress: async () => {
                        await clearLabCart();
                        setCart([]);
                        setTotals({ subtotal: 0, taxes: 0, total: 0 });
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }) => (
        <View style={styles.cartItem}>
            <View style={styles.iconBox}>
                <Ionicons name="flask" size={22} color={COLORS.primary} />
            </View>

            <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.itemParams}>{item.testsIncluded || 3} Tests Included</Text>
                <Text style={styles.itemPrice}>Rs. {item.price}</Text>
            </View>

            <TouchableOpacity
                onPress={() => handleRemoveItem(item.id)}
                style={styles.removeBtn}
            >
                <Text style={styles.removeBtnText}>X Remove</Text>
            </TouchableOpacity>
        </View>
    );

    // Get lab name from cart items
    const labName = cart.length > 0 ? (cart[0].lab || 'Apollo Labs') : 'Apollo Labs';
    const labAddress = 'T.nagar, Chennai 600017';

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Cart</Text>
                    
                    {/* Lab Badge */}
                    {cart.length > 0 && (
                        <View style={styles.labBadge}>
                            <Image
                                source={require('../../images/apollo.png')}
                                style={styles.labBadgeIcon}
                                resizeMode="contain"
                            />
                            <View>
                                <Text style={styles.labBadgeName}>{labName}</Text>
                                <Text style={styles.labBadgeAddress}>{labAddress}</Text>
                            </View>
                        </View>
                    )}
                    {cart.length === 0 && <View style={{ width: 40 }} />}
                </View>

                {cart.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconBox}>
                            <Ionicons name="cart-outline" size={80} color={COLORS.border} />
                        </View>
                        <Text style={styles.emptyTitle}>Your cart is empty</Text>
                        <Text style={styles.emptyDesc}>Looks like you haven't added any diagnostics yet.</Text>
                        <TouchableOpacity
                            style={styles.browseBtn}
                            onPress={() => navigation.navigate('LabTestsScreen')}
                        >
                            <Text style={styles.browseText}>Browse Tests</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={{ flex: 1 }}>
                        <FlatList
                            data={cart}
                            renderItem={renderItem}
                            keyExtractor={item => item.id?.toString()}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.listContent}
                            ListHeaderComponent={
                                <>
                                    {/* Your Cart Title */}
                                    <Text style={styles.cartTitle}>Your Cart ({cart.length} items)</Text>
                                </>
                            }
                            ListFooterComponent={
                                <>
                                    {/* Select Patient Names Section */}
                                    <Text style={styles.sectionTitle}>Select Patient Names</Text>
                                    
                                    {savedPatients.map((patient, index) => (
                                        <TouchableOpacity
                                            key={patient.id || index}
                                            style={styles.patientRow}
                                            onPress={() => setPatientDetails(patient)}
                                        >
                                            <View style={styles.patientInitialBox}>
                                                <Text style={styles.patientInitial}>
                                                    {patient.name?.charAt(0)?.toUpperCase() || 'P'}
                                                </Text>
                                            </View>
                                            <Text style={styles.patientRowName}>{patient.name}</Text>
                                            <View style={styles.relationBadge}>
                                                <Text style={styles.relationBadgeText}>{patient.relation}</Text>
                                            </View>
                                            <View style={[
                                                styles.checkbox,
                                                patientDetails?.id === patient.id && styles.checkboxChecked
                                            ]}>
                                                {patientDetails?.id === patient.id && (
                                                    <Ionicons name="checkmark" size={14} color={COLORS.white} />
                                                )}
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                    
                                    {/* Add New Patient Button */}
                                    <TouchableOpacity
                                        style={styles.addPatientRow}
                                        onPress={() => setShowAddPatientModal(true)}
                                    >
                                        <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
                                        <Text style={styles.addPatientRowText}>Add New Patient</Text>
                                    </TouchableOpacity>
                                    
                                    {/* Payment Breakdown */}
                                    <Text style={styles.paymentTitle}>Payment breakdown</Text>
                                    
                                    <View style={styles.paymentRow}>
                                        <Text style={styles.paymentLabel}>Subtotal</Text>
                                        <Text style={styles.paymentValue}>Rs.{totals.subtotal}</Text>
                                    </View>
                                    
                                    <View style={styles.paymentRow}>
                                        <Text style={styles.paymentLabel}>Taxes</Text>
                                        <Text style={styles.paymentValue}>Rs.{totals.taxes}</Text>
                                    </View>
                                    
                                    <View style={styles.paymentRow}>
                                        <Text style={styles.paymentLabelBold}>Total</Text>
                                        <Text style={styles.paymentValueBold}>Rs.{totals.total}</Text>
                                    </View>
                                </>
                            }
                        />


                        {/* Bottom Bar */}
                        <View style={styles.bottomBar}>
                            <View style={styles.bottomTotal}>
                                <Text style={styles.bottomTotalLabel}>Total</Text>
                                <Text style={styles.bottomTotalValue}>Rs.{totals.total}</Text>
                            </View>

                            <TouchableOpacity
                                style={styles.proceedBtn}
                                onPress={() => navigation.navigate('LabLocationScreen', { 
                                    totals: totals,
                                    cartItems: cart,
                                    patient: patientDetails 
                                })}
                            >
                                <Text style={styles.proceedBtnText}>Proceed</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </SafeAreaView>

            {/* Patient Selection Modal */}
            <Modal
                visible={showPatientModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowPatientModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Patient</Text>
                            <TouchableOpacity onPress={() => setShowPatientModal(false)}>
                                <Ionicons name="close" size={24} color={COLORS.text} />
                            </TouchableOpacity>
                        </View>
                        
                        {savedPatients.map((patient, index) => (
                            <TouchableOpacity
                                key={patient.id || index}
                                style={[
                                    styles.patientOption,
                                    patientDetails?.id === patient.id && styles.patientOptionSelected
                                ]}
                                onPress={() => handleSelectPatient(patient)}
                            >
                                <View style={styles.patientOptionIcon}>
                                    <Ionicons name="person" size={20} color={COLORS.primary} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.patientOptionName}>{patient.name}</Text>
                                    <Text style={styles.patientOptionMeta}>
                                        {patient.gender} • {patient.age} yrs • {patient.relation}
                                    </Text>
                                </View>
                                {patientDetails?.id === patient.id && (
                                    <Ionicons name="checkmark-circle" size={22} color={COLORS.success} />
                                )}
                            </TouchableOpacity>
                        ))}
                        
                        <TouchableOpacity
                            style={styles.addNewPatientBtn}
                            onPress={() => {
                                setShowPatientModal(false);
                                setShowAddPatientModal(true);
                            }}
                        >
                            <Ionicons name="add-circle" size={22} color={COLORS.primary} />
                            <Text style={styles.addNewPatientText}>Add New Patient</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Add New Patient Modal */}
            <Modal
                visible={showAddPatientModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowAddPatientModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add New Patient</Text>
                            <TouchableOpacity onPress={() => setShowAddPatientModal(false)}>
                                <Ionicons name="close" size={24} color={COLORS.text} />
                            </TouchableOpacity>
                        </View>
                        
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Patient Name *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter patient name"
                                placeholderTextColor="#999"
                                value={newPatient.name}
                                onChangeText={(text) => setNewPatient({ ...newPatient, name: text })}
                            />
                        </View>
                        
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Age *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter age"
                                placeholderTextColor="#999"
                                keyboardType="numeric"
                                value={newPatient.age}
                                onChangeText={(text) => setNewPatient({ ...newPatient, age: text })}
                            />
                        </View>
                        
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Gender</Text>
                            <View style={styles.genderRow}>
                                {['Male', 'Female', 'Other'].map((g) => (
                                    <TouchableOpacity
                                        key={g}
                                        style={[
                                            styles.genderOption,
                                            newPatient.gender === g && styles.genderOptionSelected
                                        ]}
                                        onPress={() => setNewPatient({ ...newPatient, gender: g })}
                                    >
                                        <Text style={[
                                            styles.genderText,
                                            newPatient.gender === g && styles.genderTextSelected
                                        ]}>{g}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                        
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Phone Number</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter phone number"
                                placeholderTextColor="#999"
                                keyboardType="phone-pad"
                                value={newPatient.phone}
                                onChangeText={(text) => setNewPatient({ ...newPatient, phone: text })}
                            />
                        </View>
                        
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Relation</Text>
                            <View style={styles.relationRow}>
                                {['Self', 'Spouse', 'Child', 'Parent', 'Other'].map((r) => (
                                    <TouchableOpacity
                                        key={r}
                                        style={[
                                            styles.relationOption,
                                            newPatient.relation === r && styles.relationOptionSelected
                                        ]}
                                        onPress={() => setNewPatient({ ...newPatient, relation: r })}
                                    >
                                        <Text style={[
                                            styles.relationText,
                                            newPatient.relation === r && styles.relationTextSelected
                                        ]}>{r}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                        
                        <TouchableOpacity style={styles.savePatientBtn} onPress={handleAddNewPatient}>
                            <Text style={styles.savePatientText}>Save Patient</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    safeArea: { flex: 1 },
    centerContent: { justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: wp(5),
        paddingVertical: hp(2),
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
    clearBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FEF2F2',
        alignItems: 'center',
        justifyContent: 'center',
    },
    listContent: { padding: wp(5) },
    listTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textSecondary, marginBottom: 15, textTransform: 'uppercase' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
    emptyIconBox: { width: 140, height: 140, borderRadius: 70, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    emptyTitle: { fontSize: 20, fontWeight: '900', color: COLORS.text, marginBottom: 10 },
    emptyDesc: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 30 },
    browseBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 30, paddingVertical: 15, borderRadius: 16 },
    browseText: { color: COLORS.white, fontWeight: '800', fontSize: 16 },
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 15,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    iconBox: { width: 50, height: 50, borderRadius: 14, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    itemInfo: { flex: 1 },
    itemName: { fontSize: 15, fontWeight: '800', color: COLORS.text, marginBottom: 2 },
    itemMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
    itemLab: { fontSize: 12, color: COLORS.primary, fontWeight: '700' },
    metaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: COLORS.border },
    itemParams: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '500' },
    itemPrice: { fontSize: 16, fontWeight: '900', color: COLORS.text },
    removeBtn: { padding: 8 },
    summaryCard: {
        marginHorizontal: wp(5),
        backgroundColor: COLORS.background,
        borderRadius: 24,
        padding: 20,
        marginBottom: hp(2),
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    summaryTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: 15 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    summaryLabel: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
    summaryValue: { fontSize: 14, color: COLORS.text, fontWeight: '700' },
    divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 12, borderStyle: 'dashed', borderRadius: 1 },
    totalLabel: { fontSize: 16, fontWeight: '900', color: COLORS.text },
    totalValue: { fontSize: 18, fontWeight: '900', color: COLORS.primary },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EEF2FF',
        padding: 12,
        borderRadius: 12,
        marginTop: 12,
        gap: 8,
    },
    infoText: {
        flex: 1,
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: '600',
    },
    
    // Header Styles
    labBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    labBadgeIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 8,
    },
    labBadgeName: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.text,
    },
    labBadgeAddress: {
        fontSize: 10,
        color: COLORS.textSecondary,
    },
    
    // Cart Title
    cartTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 16,
    },
    
    // Cart Item Styles
    removeBtnText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.text,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    
    // Patient Row Styles
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
        marginTop: 24,
        marginBottom: 16,
    },
    patientRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    patientInitialBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    patientInitial: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.primary,
    },
    patientRowName: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.text,
    },
    relationBadge: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 12,
    },
    relationBadgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.white,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: COLORS.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    addPatientRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        gap: 8,
    },
    addPatientRowText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.primary,
    },
    
    // Payment Breakdown Styles
    paymentTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
        marginTop: 32,
        marginBottom: 16,
    },
    paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    paymentLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    paymentValue: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    paymentLabelBold: {
        fontSize: 15,
        color: COLORS.text,
        fontWeight: '700',
    },
    paymentValueBold: {
        fontSize: 15,
        color: COLORS.text,
        fontWeight: '700',
    },
    
    // Bottom Bar Styles
    bottomBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: wp(5),
        paddingVertical: hp(2),
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    bottomTotal: {},
    bottomTotalLabel: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    bottomTotalValue: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.text,
    },
    proceedBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 50,
        paddingVertical: 16,
        borderRadius: 10,
    },
    proceedBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.white,
    },
    
    // Legacy styles kept for modals
    checkoutBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: wp(5),
        paddingVertical: hp(2),
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    priceInfo: { flex: 1 },
    payableLabel: { fontSize: 10, color: COLORS.textSecondary, fontWeight: '800' },
    payableValue: { fontSize: 22, fontWeight: '900', color: COLORS.text },
    checkoutBtn: { flex: 1, marginLeft: 20, borderRadius: 16, overflow: 'hidden' },
    btnGradient: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    checkoutText: { color: COLORS.white, fontSize: 16, fontWeight: '800' },
    
    // Patient Details Styles
    patientSection: {
        backgroundColor: COLORS.background,
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    patientHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    patientSectionTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.text,
        textTransform: 'uppercase',
    },
    changeLink: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.primary,
    },
    patientCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    patientIconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    patientInfo: { flex: 1 },
    patientName: { fontSize: 15, fontWeight: '800', color: COLORS.text, marginBottom: 2 },
    patientMeta: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
    patientPhone: { fontSize: 12, color: COLORS.primary, fontWeight: '600', marginTop: 2 },
    addPatientBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderStyle: 'dashed',
        gap: 8,
    },
    addPatientText: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.primary,
    },
    
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.text,
    },
    patientOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 12,
        marginBottom: 10,
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    patientOptionSelected: {
        backgroundColor: '#EEF2FF',
        borderColor: COLORS.primary,
    },
    patientOptionIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    patientOptionName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
    patientOptionMeta: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '500' },
    addNewPatientBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#EEF2FF',
        marginTop: 10,
        gap: 8,
    },
    addNewPatientText: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.primary,
    },
    
    // Form Styles
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 8,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 15,
        color: COLORS.text,
        backgroundColor: COLORS.background,
    },
    genderRow: {
        flexDirection: 'row',
        gap: 10,
    },
    genderOption: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    genderOptionSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    genderText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
    },
    genderTextSelected: {
        color: COLORS.white,
    },
    relationRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    relationOption: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    relationOptionSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    relationText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.text,
    },
    relationTextSelected: {
        color: COLORS.white,
    },
    savePatientBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 10,
    },
    savePatientText: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.white,
    },
});
