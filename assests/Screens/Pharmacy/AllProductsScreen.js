import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    Image,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
    scale,
    verticalScale,
    moderateScale,
    wp,
    hp,
} from '../../Utils/responsive';
import { addToCart } from '../../Utils/firebasePharmacyStorage';
import { getPharmacyProducts } from '../../Utils/firebasePrescriptionStorage';

export default function AllProductsScreen({ navigation, route }) {
    const initialSearch = route.params?.searchQuery || '';
    const [search, setSearch] = useState(initialSearch);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filteredProducts, setFilteredProducts] = useState([]);

    useEffect(() => {
        loadProducts();
    }, []);

    useEffect(() => {
        if (search.trim() === '') {
            setFilteredProducts(products);
        } else {
            const filtered = products.filter((item) =>
                item.name.toLowerCase().includes(search.toLowerCase()) ||
                (item.desc && item.desc.toLowerCase().includes(search.toLowerCase()))
            );
            setFilteredProducts(filtered);
        }
    }, [search, products]);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const fetched = await getPharmacyProducts();
            setProducts(fetched);
            // Apply initial search filter if exists
            if (initialSearch.trim()) {
                const filtered = fetched.filter((item) =>
                    item.name.toLowerCase().includes(initialSearch.toLowerCase()) ||
                    (item.desc && item.desc.toLowerCase().includes(initialSearch.toLowerCase()))
                );
                setFilteredProducts(filtered);
            } else {
                setFilteredProducts(fetched);
            }
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async (product) => {
        const result = await addToCart(product);
        // Optional: Show a toast or small feedback here
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('DrugDetailsScreen', { product: item })}
            activeOpacity={0.9}
        >
            <Image
                source={
                    item.imageName === 'drug2.png'
                        ? require('../../images/drug2.png')
                        : require('../../images/drug1.png')
                }
                style={styles.productImg}
                resizeMode="contain"
            />

            <View style={styles.cardContent}>
                <Text style={styles.productName} numberOfLines={2}>
                    {item.name}
                </Text>
                <Text style={styles.productDesc}>{item.desc || item.description}</Text>

                <View style={styles.priceRow}>
                    <Text style={styles.productPrice}>Rs. {item.price}</Text>
                    <TouchableOpacity
                        style={styles.addBtn}
                        onPress={() => handleAddToCart(item)}
                    >
                        <Ionicons name="add" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Pharmacy</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Ionicons name="search-outline" size={20} color="#888" />
                    <TextInput
                        placeholder="Search For Medicines"
                        placeholderTextColor="#999"
                        value={search}
                        onChangeText={setSearch}
                        style={styles.searchInput}
                    />
                </View>
            </View>

            <Text style={styles.sectionTitle}>
                {search.trim() ? `Results for "${search}"` : 'All Products'} ({filteredProducts.length})
            </Text>

            {/* Grid */}
            {loading ? (
                <ActivityIndicator size="large" color="#1E2E9B" style={{ marginTop: 20 }} />
            ) : filteredProducts.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="search-outline" size={64} color="#ccc" />
                    <Text style={styles.emptyTitle}>No Products Found</Text>
                    <Text style={styles.emptyText}>
                        {search.trim()
                            ? `We couldn't find any products matching "${search}"`
                            : 'No products available at the moment'}
                    </Text>
                    {search.trim() && (
                        <TouchableOpacity
                            style={styles.clearSearchBtn}
                            onPress={() => setSearch('')}
                        >
                            <Text style={styles.clearSearchText}>Clear Search</Text>
                        </TouchableOpacity>
                    )}
                </View>
            ) : (
                <FlatList
                    data={filteredProducts}
                    renderItem={renderItem}
                    keyExtractor={(item) => String(item.id)}
                    numColumns={2}
                    columnWrapperStyle={styles.columnWrapper}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: wp(5),
        paddingVertical: hp(1.5),
    },
    headerTitle: {
        fontSize: 18,
        color: '#333',
        fontWeight: '400',
    },

    searchContainer: {
        paddingHorizontal: wp(5),
        marginBottom: 10,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 30,
        paddingHorizontal: 16,
        height: 50,
    },
    searchInput: { flex: 1, marginLeft: 10, color: '#333' },

    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111',
        marginHorizontal: wp(5),
        marginTop: 10,
        marginBottom: 15,
    },

    listContent: { paddingHorizontal: wp(5), paddingBottom: 20 },
    columnWrapper: { justifyContent: 'space-between' },

    card: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#EEEEEE',
        // Slight shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    productImg: {
        width: '100%',
        height: 100,
        marginBottom: 10,
        alignSelf: 'center',
    },
    cardContent: { flex: 1 },
    productName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111',
        marginBottom: 4,
    },
    productDesc: {
        fontSize: 12,
        color: '#888',
        marginBottom: 8,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 'auto',
    },
    productPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
    },
    addBtn: {
        backgroundColor: '#1E2E9B',
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },

    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: wp(10),
        paddingTop: hp(10),
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        lineHeight: 22,
    },
    clearSearchBtn: {
        marginTop: 20,
        backgroundColor: '#1E2E9B',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
    },
    clearSearchText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
});
