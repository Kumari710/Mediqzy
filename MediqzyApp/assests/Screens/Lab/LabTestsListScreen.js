import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image,
    StatusBar,
    FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import { addToLabCart } from '../../Utils/firebaseLabStorage';

const COLORS = {
    primary: '#1A1A8E',
    secondary: '#3B4FBF',
    accent: '#FFB800',
    white: '#FFFFFF',
    background: '#F8FAFC',
    text: '#1A1A2E',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    success: '#10B981',
};

export default function LabTestsListScreen({ navigation, route }) {
    const { tests = [], title = 'Lab Tests', initialSearch = '' } = route.params || {};
    const [search, setSearch] = useState(initialSearch);
    const [cartItems, setCartItems] = useState([]);

    // Filter out any invalid/empty test entries and apply search
    const filteredTests = useMemo(() => {
        // First filter out items without proper name/price data
        const validTests = tests.filter(t => 
            t && (t.name || t.testName || t.title || (t.id && !String(t.id).startsWith('-')))
        );
        
        if (!search.trim()) return validTests;
        const s = search.toLowerCase();
        return validTests.filter(t => {
            const name = (t.name || t.testName || t.title || String(t.id || '')).toLowerCase();
            const lab = (t.lab || t.labName || '').toLowerCase();
            return name.includes(s) || lab.includes(s);
        });
    }, [tests, search]);

    const addItemToCart = async (test) => {
        const res = await addToLabCart(test);
        if (res.success) {
            setCartItems(res.cart);
        }
    };

    const isInCart = (id) => cartItems.some(i => String(i.id) === String(id));

    const renderTestItem = ({ item, index }) => {
        // Get price from multiple possible fields
        const price = item.price || item.cost || item.amount || item.discountedPrice || item.originalPrice || 612;
        // Get name from multiple possible fields
        // Only use ID as name if it looks like a readable name (contains letters, not just numbers/special chars)
        const idStr = item.id ? String(item.id) : '';
        const idLooksLikeName = idStr && /[a-zA-Z]/.test(idStr) && !idStr.startsWith('-');
        const idAsName = idLooksLikeName ? idStr.replace(/_/g, ' ') : null;
        const testName = item.name || item.testName || item.title || item.test_name || idAsName || 'Lab Test';
        
        return (
            <View style={styles.card}>
                <View style={styles.cardTop}>
                    <View style={styles.iconBox}>
                        <Image source={require('../../images/vector.png')} style={styles.testIcon} />
                    </View>
                    <View style={styles.info}>
                        <Text style={styles.testName} numberOfLines={1}>{testName}</Text>
                        <Text style={styles.included}>{item.testsIncluded || item.testCount || item.tests_included || 1} Tests Included</Text>
                    </View>
                    <Text style={styles.price}>₹{price}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.footer}>
                    <View style={styles.labRow}>
                        <Image source={require('../../images/apollo.png')} style={styles.labLogo} />
                        <Text style={styles.labName}>{item.lab || item.labName || item.lab_name || 'Apollo Labs'}</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.addBtn, isInCart(item.id) && styles.addBtnDone]}
                        onPress={() => addItemToCart(item)}
                    >
                        <Text style={styles.addBtnText}>{isInCart(item.id) ? 'Added' : 'Add'}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };
    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{title}</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('LabCartScreen')}>
                        <Ionicons name="cart-outline" size={26} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color={COLORS.textSecondary} />
                    <TextInput
                        placeholder="Search Tests..."
                        placeholderTextColor={COLORS.textSecondary}
                        value={search}
                        onChangeText={setSearch}
                        style={styles.searchInput}
                    />
                </View>

                <FlatList
                    data={filteredTests}
                    renderItem={renderTestItem}
                    keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={styles.emptyText}>No tests found</Text>
                        </View>
                    }
                />
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: wp(5), paddingVertical: 15 },
    headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, flex: 1, marginHorizontal: 15 },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },

    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', marginHorizontal: wp(5), paddingHorizontal: 15, height: 50, borderRadius: 15, marginBottom: 15 },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 14, color: COLORS.text },

    list: { paddingHorizontal: wp(5), paddingBottom: 30 },
    card: { backgroundColor: COLORS.white, borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
    cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    iconBox: { width: 44, height: 44, borderRadius: 10, borderWidth: 1, borderColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
    testIcon: { width: 22, height: 22, resizeMode: 'contain' },
    info: { flex: 1 },
    testName: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
    included: { fontSize: 12, color: COLORS.textSecondary },
    price: { fontSize: 15, fontWeight: '800', color: COLORS.primary },

    divider: { height: 1, backgroundColor: '#F1F5F9' },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
    labRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    labLogo: { width: 36, height: 18, resizeMode: 'contain' },
    labName: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
    addBtn: { backgroundColor: COLORS.primary, paddingVertical: 6, paddingHorizontal: 16, borderRadius: 8 },
    addBtnDone: { backgroundColor: COLORS.success },
    addBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 12 },

    empty: { marginTop: 50, alignItems: 'center' },
    emptyText: { color: COLORS.textSecondary, fontSize: 16 },
});
