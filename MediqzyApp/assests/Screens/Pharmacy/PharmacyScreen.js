import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

import {
  scale,
  verticalScale,
  moderateScale,
  wp,
  hp,
} from '../../Utils/responsive';

import { addToCart, getCartCount } from '../../Utils/firebasePharmacyStorage';
import {
  getPharmacyProducts,
  seedPharmacyProducts,
  updatePharmacyProductImages,
} from '../../Utils/firebasePrescriptionStorage';

/* ------------------ DEFAULT DATA ------------------ */

const DEFAULT_PRODUCTS = [
  { id: 1, name: 'Panadol', desc: '20pcs', price: 200, imageName: 'drug1.png' },
  { id: 2, name: 'Bodrex Herbal', desc: '100ml', price: 120, imageName: 'drug2.png' },
  { id: 3, name: 'Konidin', desc: '3pcs', price: 60, imageName: 'drug1.png' },
];

const FOR_SALE_PRODUCTS = [
  {
    id: 101,
    name: 'Panadol',
    desc: '20 pcs',
    price: 200,
    salePrice: 150,
    discount: 25, // %
    imageName: 'drug1.png',
    category: 'Medicines',
  },
  {
    id: 102,
    name: 'Bodrex Herbal',
    desc: '100 ml',
    price: 120,
    salePrice: 90,
    discount: 25,
    imageName: 'drug2.png',
    category: 'Medicines',
  },
  {
    id: 103,
    name: 'Vitamin C 1000mg',
    desc: '30 Tablets',
    price: 350,
    salePrice: 280,
    discount: 20,
    imageName: 'drug1.png',
    category: 'Wellness',
  },
  {
    id: 104,
    name: 'Omega 3 Fish Oil',
    desc: '60 Softgels',
    price: 599,
    salePrice: 449,
    discount: 25,
    imageName: 'drug2.png',
    category: 'Wellness',
  },
  {
    id: 105,
    name: 'Sunscreen SPF 50',
    desc: '50 g',
    price: 450,
    salePrice: 360,
    discount: 20,
    imageName: 'drug1.png',
    category: 'Skin Care',
  },
  {
    id: 106,
    name: 'Moisturizer Cream',
    desc: '100 g',
    price: 320,
    salePrice: 240,
    discount: 25,
    imageName: 'drug2.png',
    category: 'Skin Care',
  },
  {
    id: 107,
    name: 'Hand Sanitizer',
    desc: '200 ml',
    price: 99,
    salePrice: 69,
    discount: 30,
    imageName: 'drug1.png',
    category: 'Personal',
  },
  {
    id: 108,
    name: 'Digital Thermometer',
    desc: '1 Unit',
    price: 250,
    salePrice: 199,
    discount: 20,
    imageName: 'drug2.png',
    category: 'Devices',
  },
];

/* ------------------ SCREEN ------------------ */

export default function PharmacyScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    return products.filter(product =>
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      (product.desc && product.desc.toLowerCase().includes(search.toLowerCase()))
    );
  }, [products, search]);

  useFocusEffect(
    useCallback(() => {
      loadProducts();
      loadCartCount();
    }, [])
  );

  const loadCartCount = async () => {
    const count = await getCartCount();
    setCartCount(count);
  };

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      let fetched = await getPharmacyProducts();
      if (fetched.length === 0) {
        await seedPharmacyProducts(DEFAULT_PRODUCTS);
        fetched = await getPharmacyProducts();
      }

      updatePharmacyProductImages(DEFAULT_PRODUCTS).catch(() => { });
      setProducts(fetched);
    } catch {
      setProducts(DEFAULT_PRODUCTS);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleAddToCart = async (product) => {
    const result = await addToCart(product);
    if (result.success) {
      const total = result.cart.reduce(
        (sum, item) => sum + (item.qty || 1),
        0
      );
      setCartCount(total);
    }
  };

  /* ------------------ UI ------------------ */

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Left */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerSide}
        >
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>

        {/* Center */}
        <Text style={styles.headerTitle}>Pharmacy</Text>

        {/* Right */}
        <View style={[styles.headerSide, styles.headerRight]}>
          <TouchableOpacity onPress={() => navigation.navigate('ManageProductsScreen')}>
            <Ionicons name="time-outline" size={24} style={styles.headerIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('PharmacyCartScreen')}>
            <Ionicons name="cart-outline" size={26} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: hp(5) }}
      >
        {/* Search */}
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

        {/* Prescription Banner */}
        <TouchableOpacity
          style={styles.bannerWrap}
          onPress={() => navigation.navigate('UploadPrescriptionScreen')}
        >
          <LinearGradient
            colors={['#ffffff', '#E8F0FE', '#7BA3D8', '#4B6CB7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.banner}
          >
            <View style={styles.bannerText}>
              <Text style={styles.bannerTitle}>
                Order quickly with{'\n'}Prescription
              </Text>
              <View style={styles.uploadBtn}>
                <Text style={styles.uploadText}>Upload Prescription</Text>
              </View>
            </View>

            <Image
              source={require('../../images/Tablet.png')}
              style={styles.bannerImg}
            />
          </LinearGradient>
        </TouchableOpacity>

        {/* CTA Buttons */}
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => navigation.navigate('PharmacyListScreen')}
        >
          <Ionicons name="medical-outline" size={22} color="#fff" />
          <Text style={styles.ctaText}>View Pharmacies</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => navigation.navigate('FavouritesScreen')}
        >
          <Ionicons name="heart-outline" size={22} color="#fff" />
          <Text style={styles.ctaText}>View Favourites</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>


        {/* Popular Products */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{search.trim() ? 'Search Results' : 'Popular Product'}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AllProductsScreen', { searchQuery: search })}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {loadingProducts ? (
          <ActivityIndicator style={{ marginTop: 20 }} />
        ) : filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No products found for "{search}"</Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: hp(2) }}
          >
            {filteredProducts.slice(0, 6).map(prod => (
              <TouchableOpacity key={prod.id} style={styles.productCard} onPress={() => navigation.navigate('DrugDetailsScreen', { product: prod })}>
                <Image
                  source={
                    prod.imageName === 'drug2.png'
                      ? require('../../images/drug2.png')
                      : require('../../images/drug1.png')
                  }
                  style={styles.productImg}
                />

                <Text style={styles.productName}>{prod.name}</Text>
                <Text style={styles.productDesc}>{prod.desc}</Text>
                <Text style={styles.productPrice}>₹ {prod.price}</Text>

                <TouchableOpacity
                  style={styles.plusBtn}
                  onPress={() => handleAddToCart(prod)}
                >
                  <Ionicons name="add" size={20} color="#fff" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Products for Sale - Only show when not searching */}
        {!search.trim() && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Products for Sale</Text>
              <TouchableOpacity onPress={() => navigation.navigate('AllProductsScreen', { searchQuery: '' })}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: hp(2) }}
            >
              {products.slice(0, 6).map(prod => (
                <TouchableOpacity
                  key={`sale-${prod.id}`}
                  style={styles.productCard}
                  onPress={() => navigation.navigate('DrugDetailsScreen', { product: prod })}
                >
                  <Image
                    source={
                      prod.imageName === 'drug2.png'
                        ? require('../../images/drug2.png')
                        : require('../../images/drug1.png')
                    }
                    style={styles.productImg}
                  />

                  <Text style={styles.productName}>{prod.name}</Text>
                  <Text style={styles.productDesc}>{prod.desc}</Text>
                  <Text style={styles.productPrice}>₹ {prod.price}</Text>

                  <TouchableOpacity
                    style={styles.plusBtn}
                    onPress={() => handleAddToCart(prod)}
                  >
                    <Ionicons name="add" size={20} color="#fff" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

/* ------------------ STYLES ------------------ */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.5),
  },

  headerRight: { flexDirection: 'row', alignItems: 'center' },
  headerIcon: { marginRight: 16 },
  headerTitle: { fontSize: 18, fontWeight: 400 },
  cartBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FF4D4D',
    borderRadius: 10,
    paddingHorizontal: 6,
  },
  cartBadgeText: { color: '#fff', fontSize: 10 },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    margin: wp(5),
    borderRadius: 30,
    paddingHorizontal: 16,
    height: 50,
  },
  searchInput: { flex: 1, marginLeft: 10, color: 'black' },

  bannerWrap: {
    marginHorizontal: wp(5),
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  banner: { flexDirection: 'row', padding: 20, alignItems: 'center' },
  bannerText: { flex: 1 },
  bannerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111' },

  uploadBtn: {
    backgroundColor: '#1E2E9B',
    marginTop: 12,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
  },
  uploadText: { color: '#fff', fontSize: 12 },

  bannerImg: { width: 100, height: 100 },

  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E2E9B',
    marginHorizontal: wp(5),
    marginTop: 14,
    borderRadius: 14,
    padding: 16,
  },
  ctaText: { color: '#fff', flex: 1, marginLeft: 12, fontWeight: '600' },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: wp(5),
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  seeAll: { color: '#1E2E9B', fontWeight: '600' },

  productCard: {
    width: wp(40),
    backgroundColor: '#fff',
    borderRadius: 18,
    marginLeft: wp(5),
    padding: 14,
    elevation: 4,
  },
  productImg: { width: '100%', height: 80, resizeMode: 'contain' },
  productName: { fontWeight: 'bold', marginTop: 8 },
  productDesc: { fontSize: 12, color: '#777' },
  productPrice: { fontWeight: 'bold', marginTop: 4 },

  plusBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#1E2E9B',
    width: 34,
    height: 34,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(4),
    marginHorizontal: wp(5),
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});
